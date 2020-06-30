import requests
import json
from contextlib import closing
import csv
from datetime import date, timedelta
import sys

def getAllCasesByDate(date, data):
    filteredstuff = [row for row in data if row[0]==date]
    casesJ = {}
    #print (filteredstuff)
    for state in filteredstuff:
        try:
            stateID = state[2]
            casesJ[stateID] = {}
            casesJ[stateID]['amount'] =  int(state[3])
            casesJ[stateID]['deaths'] =  int(state[4])
        except Exception:
            print('huh')
    return casesJ

def getAllCasesByState(stateName, data):
    filteredstuff = [row for row in data if row[2]==stateName]
    for x in filteredstuff:
        print(x)

def getAllCasesByStateAndDate(date, stateName, data):
    filteredstuff = [row for row in data if (row[0]==date and row[2]==stateName)]
    #print(len(filteredstuff))
    for x in filteredstuff:
        print(x)

def mergeJson(csvDataJ, date):
    #print('merging pop JSON')
    badstates = 0
    completeJ = {}
    completeJ[date] = []
    maxRate = 0
    with open('popFiles/states-with-pops.json', 'r') as f:
        states = json.load(f)
    for i in range(len(states['features'])):
        try:
            stateID = states['features'][i]['properties']['STATE']
            pops = int(states['features'][i]['properties']['POPESTIMATE2019'])
            amount = csvDataJ[stateID]['amount']
            deaths = csvDataJ[stateID]['deaths']
            IR = (int(csvDataJ[stateID]['amount'])/int(states['features'][i]['properties']['POPESTIMATE2019']))*100000
            DR = (int(csvDataJ[stateID]['deaths'])/int(states['features'][i]['properties']['POPESTIMATE2019']))*100000
            
            dataToAdd = {
                'STATE' : stateID,
                'population' : pops,
                'confirmed': amount,
                'deaths' : deaths,
                'infection_rate' : IR,
                'death_rate' : DR
            }
            completeJ[date].append(dataToAdd)

        except Exception:
            dataToAdd = {
                'STATE' : stateID,
                'population' : pops,
                'confirmed': 0,
                'deaths' : 0,
                'infection_rate' : 0,
                'death_rate' : 0
            }  
            completeJ[date].append(dataToAdd)
            badstates+=1
    #print (maxRate)
    #print (badstates) 
    return completeJ


url = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv'
rows = []

with closing(requests.get(url, stream=True)) as r:
    f = (line.decode('utf-8') for line in r.iter_lines())
    reader = csv.reader(f, delimiter=',', quotechar='"')
    for row in reader:
        rows.append(row)
        #print(row)


#getAllCasesByState('Texas', rows)
#getAllCasesByStateAndDate('2020-04-25', 'Texas', rows)

bigBoi = {}

start = date(2020, 1, 21)
end = date.today()
day = timedelta(days=1)

mydate = start
while mydate < end:
    daytoGet = "{date.year:04}-{date.month:02}-{date.day:02}".format(date=mydate)

    dailyJ = mergeJson(getAllCasesByDate(daytoGet, rows), daytoGet)
    bigBoi.update(dailyJ)

    fileName = 'outputFiles/states/' + daytoGet + '.json'

    with open(fileName, 'w') as dailyFile:
        json.dump(dailyJ, dailyFile, separators=(',', ': '))
        dailyFile.close()

    mydate += day
    #countiesJ = mergeJson(extractCsvByDate(fileName), fileName)

    #outFileName = 'outputFiles/'+ fileName +'.json'
    
with open('../time-series-states.json' ,'w') as f:
    json.dump(bigBoi, f, separators=(',', ': '))

print("Successfully scraped state data for {date.year:04}-{date.month:02}-{date.day:02}".format(date=mydate-day))
sys.exit()
