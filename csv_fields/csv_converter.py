import csv
with open("absorbances.csv") as file:
    cdata = file.read()

print(cdata)

# implementation of csv parsed

def get_values(*names):
            import json
            _all_values = json.loads("""{"transfer_csv":",1,2,3,4,5,6,7,8,9,10,11,12\\nA,-0.001,-0.001,0.211,0.233,0.478,0.487,0.98,0.978,1.505,1.51,2.428,2.457\\nB,-0.001,0,0.236,0.23,0.489,0.488,0.982,0.978,1.518,1.52,2.466,2.48\\nC,0,0,0.233,0.236,0.488,0.49,0.978,0.98,1.513,1.515,2.48,2.461\\nD,0,0,0.237,0.239,0.488,0.487,0.975,0.973,1.512,1.516,2.492,2.495\\nE,0,0.001,0.238,0.237,0.493,0.49,0.984,0.984,1.516,1.515,2.461,2.46\\nF,0.001,0,0.237,0.238,0.493,0.496,0.985,0.984,1.516,1.521,2.498,2.497\\nG,0.001,-0.001,0.24,0.236,0.494,0.494,0.988,0.989,1.526,1.535,2.536,2.536\\nH,0.001,-0.001,0.239,0.24,0.495,0.495,0.99,0.989,1.522,1.526,2.525,2.506\\n,,,,,,,,,,,,\\n,,,,,,,,,,,,\\n,,,,,,,,,,,,\\n,1,2,3,4,5,6,7,8,9,10,11,12\\nA,,,,,,,,,,,,\\nB,,,,,,,,,,,,\\nC,,,,,,,,,,,,\\nD,,,,,,,,,,,,\\nE,,,,,,,,,,,,\\nF,,,,,,,,,,,,\\nG,,,,,,,,,,,,\\nH,,,,,,,,,,,,\\n,,,,,,,,,,,,\\n,,,,,,,,,,,,\\n,,,,,,,,,,,,\\nSample Wavelength (nm),450,,,,,,,,,,,\\nReference Wavelength (nm),-1,,,,,,,,,,,\\n"}""")
            return [_all_values[n] for n in names]
csv_data = get_values("transfer_csv")

data_string = csv_data[0]

# Split the string into rows
rows = data_string.split('\n')

# Slice to get the first 9 rows
rows = rows[:9]

# Initialize an empty list to store the processed rows
processed_rows = []

# Iterate through each row
for row in rows:
    # Split the row into values
    values = row.split(',')
    
    # Append the list of values to the processed_rows list
    processed_rows.append(values)
data = processed_rows
result_dict = {}
for i in range(1, len(data)):
    row = data[i]
    for j in range(1, len(row)):
        cell_identifier = row[0] + data[0][j]
        result_dict[cell_identifier] = row[j]
    
print(result_dict)

# here's how to read the absorbance value in A5 well
float(result_dict['A5'])