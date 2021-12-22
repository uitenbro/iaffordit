###################################################################################################### 
# This script reads a transaction file and creates a localdata structure containing the updated
# format via javascript
#
# fileName: Name of transaction.dat file from original iAffordIt app
#
# Usage: updateIAffordItTransaction.py ["transactions.dat"]
#
###################################################################################################### 

import os, fnmatch
import re, datetime

key = 1617808458779
jsonStr = "{"

def updateIAffordItTransactions(fileName):
    
    with open(fileName) as f:
        s = f.read()
    print ("File: " + fileName)

    transRegex = re.compile("<transaction>(.*?)</transaction>", re.DOTALL)
    transactions = re.findall(transRegex, s)

    for trans in transactions:
        transParts = re.search("<date>(.*?)</date><name>(.*?)</name>\n\s+<freq>(.*?)</freq><type>(.*?)</type><amount>(.*?)</amount><tags>(.*?)</tags>", trans)
        print(transParts.group(1), transParts.group(2),"\n\t", transParts.group(3), transParts.group(4),transParts.group(5), transParts.group(6))

        global key 
        key = key + 11
        name = transParts.group(2)

        dateParts = re.search("(\d+)\/(\d+)\/(\d+)", transParts.group(1))
        d = datetime.datetime(int(dateParts.group(3)), int(dateParts.group(1)), int(dateParts.group(2)), 0, 0)
        dateStr = d.isoformat() + ".000Z"

        freq = transParts.group(3)
        amount = transParts.group(5)
        billdep = transParts.group(4)
        tags = transParts.group(6)

        global jsonStr
        jsonStr = jsonStr + '\"' + str(key) + '\":{'
        jsonStr = jsonStr +     '\n    \"name\":\"' + name + '\",' 
        jsonStr = jsonStr +     '\n    \"date\":\"' + dateStr + '\",'
        jsonStr = jsonStr +     '\n    \"freq\":\"' + freq + '\",'
        jsonStr = jsonStr +     '\n    \"amount\":' + amount + ','
        jsonStr = jsonStr +     '\n    \"type\":\"' + billdep + '\",'
        jsonStr = jsonStr +     '\n    \"tags\":\"' + tags + '\"},\n'

    jsonStr = jsonStr[:-2]+"\n}"
    print(jsonStr)     

    with open(fileName+".js", "w") as g:
        g.write(jsonStr)

updateIAffordItTransactions("transactions sw visa.dat")


# {"1617808458779":
# {"name":"Weekly Bill",
# "date":"2021-04-07T15:14:18.779Z",
# "freq":"wkl",
# "amount":250,
# "type":"bill",
# "tags":"zero"},
# "1617808458780":
# {"name":"Monthly Bill",
# "date":"2021-04-07T15:14:18.779Z",
# "freq":"mon",
# "amount":400,
# "type":"bill",
# "tags":"one"},
# "1617808458781":
# {"name":"Monthly Deposit",
# "date":"2021-04-07T15:14:18.779Z",
# "freq":"mon",
# "amount":1500,
# "type":"dep",
# "tags":"two"},
# "1617808458782":
# {"name":"Quarterly Bill",
# "date":"2021-04-07T15:14:18.779Z",
# "freq":"qtr",
# "amount":100,
# "type":"bill",
# "tags":"three"},
# "1617808458783":
# {"name":"Monthly Expense",
# "date":"2021-04-07T15:14:18.779Z",
# "freq":"mon",
# "amount":250,
# "type":"bill",
# "tags":"five"}}