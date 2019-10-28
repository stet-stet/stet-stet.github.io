const puppeteer = require('puppeteer');
var fs = require('fs');

async function get_bms_names(page){
    await page.goto("http://manbow.nothing.sh/event/event.cgi?action=sp&event=127",{timeout:120000});

    const the_list = await page.$$eval('tr',trs=>{
        const templist = trs.map(tr=>Array.from(tr.getElementsByTagName('td')));
        return templist.map(temp=>temp.map(a=>a.innerText));
    });
    return the_list.filter(a=>{return a.length>0 && !isNaN(Number(a[0]));});
}

async function scrap(number,page){
    //vote: .toggle-bg .col_one_third 인데, toggle-bg 클릭해서 열어놓아야 함.
    //점수는 .i-alt, 닉네임은 h4

    //short: .spost .points_oneline이 있는 경우. 
    //점수: .points_oneline gettext
    //사람: .entry-c > .entry-title > strong

    //long: .spost .points_normal이 있는 경우
    //점수 .points_normal gettext
    //사람 .entry-c > .entry-title > strong
    const url = `http://manbow.nothing.sh/event/event.cgi?action=More_def&num=${number}&event=127`
    for(let j=0;j<=5;++j){
        try{
            await page.goto(url,{timeout:120000});
            break;
        }
        catch(TimeoutError){
            if(j==5) return [];
        }
    }
    
    //const name = await page.$eval('.col_two_third > h2',(a)=>{return a.innerText;} );
    //votes
    await page.$$eval('.togglet',buttons=>{
        const len = buttons.length;
        buttons[len-1].click();
        return true;
    })
    let votes = await page.$$eval('.toggle-bg .col_one_third',votes=>{
        return votes.map(vote=>[
                vote.querySelector('.i-alt').innerText.trim(),
                vote.querySelector('h4').innerText.trim(),
                vote.innerHTML.match(/h4>\((.*)\)<p/)[1]
            ]);
    });
    votes = votes.map(a=>{
        return {
            id: number,
            score: a[0],
            person: a[1],
            hash: a[2]
        }
    });
    
    let shorts = await page.$$eval('.spost',sposts=>{
        const shortimpre = sposts.filter(a=>Array.from(a.getElementsByClassName('points_oneline')).length>0);
        return shortimpre.map(imp=>[
                imp.getElementsByClassName('points_oneline')[0].innerText.trim(),
                imp.querySelector('.entry-title strong').innerText.trim(),
                imp.innerHTML.match(/"color:#ccc">\((.*)\)<\/span>/)[1]
            ]);
    });
    shorts=shorts.map(a=>{
        return {
            id: number,
            score: a[0],
            person: a[1],
            hash: a[2]
        }
    });

    let longs = await page.$$eval('.spost',sposts=>{
        const longimpre = sposts.filter(a=>Array.from(a.getElementsByClassName('points_normal')).length>0);
        return longimpre.map(imp=>[
                imp.getElementsByClassName('points_normal')[0].innerText.trim(),
                imp.querySelector('.entry-title strong').innerText.trim(),
                imp.innerHTML.match(/"color:#ccc">\((.*)\)<\/span>/)[1]
            ]);
    })
    longs=longs.map(a=>{
        return {
            id: number,
            score: a[0],
            person: a[1],
            hash: a[2]
        }
    });
    //console.log(votes);
    //console.log(shorts);
    //console.log(longs);
    return votes.concat(shorts).concat(longs);
}

async function rebuild_database(page){
    let db=[],empty_entries=[];
    const id_name = await get_bms_names(page);
    const list = id_name.map(a=>Number(a[0]));
    const entries = list.length;
    //console.log(entries);
    for(let i=0;i<entries;i++){
        console.log(id_name[i]);
        await new Promise(function(resolve){setTimeout(function(){resolve('foo');},3000);}); 
        // blocking delay 3000ms
        const a = await scrap(list[i],page);
        //console.log(a);
        if(a.length===0) empty_entries.push(list[i]);
        db = db.concat(a);
    }
    //console.log(db);
    var data = {};
    data.table = db;
    data.empty = empty_entries;
    return data;
}

async function write_to_file(db){
    fs.writeFileSync('data.json',JSON.stringify(db,null,2),function(error){
        console.log("complete!go take a look");
    })    
}

async function handler(){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    var db = await rebuild_database(page);
    await page.close();
    await browser.close();
    await write_to_file(db);
}

handler();