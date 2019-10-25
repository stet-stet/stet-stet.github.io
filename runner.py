import subprocess

subprocess.call("node scrap.js",shell=True)
subprocess.call("git add *",shell=True)
subprocess.call("git commit -m 'update'",shell=True)
subprocess.call("git push remote ")