import subprocess
from time import sleep

def doit():
  subprocess.call("node scrap.js",shell=True)
  subprocess.call("git add *",shell=True)
  subprocess.call('git commit -m "update"',shell=True)
  subprocess.call("git pull origin master",shell=True)
  subprocess.call("git push origin master",shell=True)

if __name__=="__main__":
  doit()
