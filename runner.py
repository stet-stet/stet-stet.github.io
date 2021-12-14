import subprocess
import sys
from time import sleep

def doit(scrap_source):
  subprocess.call(f"node {scrap_source}",shell=True)
  subprocess.call("git add *",shell=True)
  subprocess.call('git commit -m "update"',shell=True)
  subprocess.call("git pull origin master",shell=True)
  subprocess.call("git push origin master",shell=True)

if __name__=="__main__":
  doit(sys.argv[1])
