import json

with open('counties-with-pops.json','r') as inputFile:
    data = json.load(inputFile)

for i in range(len(data['features'])):
    fipsCode = data['features'][i]['properties']['STATE'] + data['features'][i]['properties']['COUNTY']
    data['features'][i]['properties']['fips'] = fipsCode
    #print(data['features'][i]['properties'])

with open('counties-with-pops-f.json','w') as f:
    json.dump(data,f,separators=(',', ': '))