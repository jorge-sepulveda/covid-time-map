import sys
from datetime import date, timedelta
from subprocess import call

exec(open("./mergestates.py").read())
exec(open("./mergecounties.py").read())

end = date.today()
day = timedelta(days=1)

#Commit Message
messageDate = "Script data update:{date.year:04}-{date.month:02}-{date.day:02}".format(date=end-day)

#Stage the file 
call('git add .', shell = True)

# Add your commit
call('git commit -m "'+ messageDate +'"', shell = True)

#Push the new or update files
call('git push origin master', shell = True)

print("pushed to github")
sys.exit()