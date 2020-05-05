import csv
import json
import pandas as pd
import sys 
from datetime import date, timedelta


def extractCsvByDate(date):
    #print('extracting the counties CSV')
    fields = []
    rows = []
    USdata = []
    USdataJ = {}
    with open('../csse_covid_19_data/csse_covid_19_daily_reports/'+ date + '.csv', 'r') as csvfile:
        csvreader = csv.reader(csvfile)
        fields = next(csvreader)
        for row in list(csvreader):
            rows.append(row) 
        # get total number of rows 
        #print("Total no. of rows: %d"%(csvreader.line_num))
    # get just regions in the US
    for row in rows:
        if row[3] == 'US':
            USdata.append(row)
    
    for county in USdata:
        try:
            fipsCode = county[0].zfill(5)
            #print(fipsCode)
            USdataJ[fipsCode] = {}
            USdataJ[fipsCode]['amount'] = int(county[7])
            USdataJ[fipsCode]['deaths'] = int(county[8])
            USdataJ[fipsCode]['recovered'] = int(county[9])
            USdataJ[fipsCode]['active'] = int(county[10])
        except Exception:
            #print(fipsCode)
            pass

    with open('outputFiles/countyData.json','w') as f:
        json.dump(USdataJ,f,indent=2)

    return USdataJ



def mergeJson(csvDataJ, date):
    #print('merging pop JSON')
    badcounties = 0
    fuckingJ = {}
    fuckingJ[date] = []
    maxRate = 0
    with open('popFiles/counties-with-pops.json', 'r') as f:
        counties = json.load(f)
    for i in range(len(counties['features'])):
        try:
            fipsCode = counties['features'][i]['properties']['STATE'] + counties['features'][i]['properties']['COUNTY']
            amount = csvDataJ[fipsCode]['amount']
            deaths = csvDataJ[fipsCode]['deaths']
            recovered = csvDataJ[fipsCode]['recovered']
            active = csvDataJ[fipsCode]['active']
            pops = int(counties['features'][i]['properties']['POPESTIMATE2019'])
            IR = (int(csvDataJ[fipsCode]['amount'])/int(counties['features'][i]['properties']['POPESTIMATE2019']))*100000
            
            dataToAdd = {
                'fips' : fipsCode,
                'population' : pops,
                'confirmed': amount,
                'deaths' : deaths,
                'recovered' : recovered,
                'active' : active,
                'infection_rate' : IR
            }
            fuckingJ[date].append(dataToAdd)
            #counties['features'][i]['properties']['deaths'] = csvDataJ[fipsCode]['deaths']
            #counties['features'][i]['properties']['recovered'] = csvDataJ[fipsCode]['recovered']
            #counties['features'][i]['properties']['active'] = csvDataJ[fipsCode]['active']
            #infection_rate = (int(csvDataJ[fipsCode]['confirmed'])/int(counties['features'][i]['properties']['POPESTIMATE2019']))*100000
            #counties['features'][i]['properties']['infection_rate'] = infection_rate
            #counties['features'][i]['properties']['fips'] = fipsCode
        except Exception:
            dataToAdd = {
                'fips' : fipsCode,
                'population' : pops,
                'confirmed': 0,
                'deaths' : 0,
                'recovered' : 0,
                'active' : 0,
                'infection_rate' : 0
            }  
            fuckingJ[date].append(dataToAdd)
            #counties['features'][i]['properties']['amount'] = 0
            #counties['features'][i]['properties']['deaths'] = 0
            #counties['features'][i]['properties']['recovered'] = 0
            #counties['features'][i]['properties']['active'] = 0
            #counties['features'][i]['properties']['infection_rate'] = 0
            #counties['features'][i]['properties']['fips'] = fipsCode
            #print ('invalid: ' + fipsCode)
            badcounties+=1
            pass
    #print (maxRate)
    #print (badcounties)
    return fuckingJ



if __name__ == "__main__":
    print(f"Arguments count: {len(sys.argv)}")
    #fileName = sys.argv[1]

    start = date(2020, 3, 22)
    end = date.today()
    day = timedelta(days=1)

    bigBoi = {}

mydate = start
while mydate < end:
    print("{date.month:02}-{date.day:02}-{date.year}".format(date=mydate))

    daytoGet = "{date.month:02}-{date.day:02}-{date.year}".format(date=mydate)
    bigBoi.update(mergeJson(extractCsvByDate(daytoGet), daytoGet))
    mydate += day


    #countiesJ = mergeJson(extractCsvByDate(fileName), fileName)

    #outFileName = 'outputFiles/'+ fileName +'.json'
    
with open('outputFiles/time-series-states.json' ,'w') as f:
    json.dump(bigBoi, f, separators=(',', ': '))

sys.exit()
