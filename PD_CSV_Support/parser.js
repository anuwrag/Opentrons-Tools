let originalJSON = null;
let modifiedJSON = null;
let labwareMap = new Map();
let originalFileName = '';

// File input handlers
document.getElementById('jsonFileInput').addEventListener('change', handleJSONUpload);
document.getElementById('csvFileInput').addEventListener('change', handleCSVUpload);
document.getElementById('downloadCSV').addEventListener('click', downloadCSV);
document.getElementById('downloadJSON').addEventListener('click', downloadUpdatedJSON);

function parseLabwareInfo(json) {
    // Clear existing mappings
    labwareMap.clear();
    
    // Extract labware information from savedStepForms
    if (json.designerApplication?.data?.savedStepForms) {
        const initialSetup = json.designerApplication.data.savedStepForms.__INITIAL_DECK_SETUP_STEP__;
        if (initialSetup?.labwareLocationUpdate) {
            for (const [labwareId, _] of Object.entries(initialSetup.labwareLocationUpdate)) {
                // Extract display name from labware ID
                // Format: "uuid:opentrons/labwareName/version"
                const matches = labwareId.match(/^[^:]+:([^/]+)\/([^/]+)\/\d+$/);
                if (matches) {
                    const manufacturer = matches[1];
                    const labwareName = matches[2];
                    // Convert to readable format (e.g., "Opentrons 96 Well Plate")
                    const displayName = labwareName
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                    labwareMap.set(labwareId, displayName);
                }
            }
        }
    }
}

function getLabwareDisplayName(labwareId) {
    return labwareMap.get(labwareId) || labwareId;
}

function handleJSONUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Store the original filename without .json extension
    originalFileName = file.name.replace('.json', '');

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            originalJSON = JSON.parse(e.target.result);
            parseLabwareInfo(originalJSON); // Parse labware information first
            const commands = parseCommands(originalJSON);
            displayTable(commands);
            document.getElementById('downloadCSV').disabled = false;
            showAlert('Protocol JSON file loaded successfully');
        } catch (error) {
            console.error('Error parsing JSON:', error);
            showAlert('Error parsing JSON file', 'danger');
        }
    };
    reader.readAsText(file);
}

function parseCommands(json) {
    const commands = [];
    let currentPair = {};
    let currentConfigVolume = null;
    
    if (!json.commands || !Array.isArray(json.commands)) {
        console.error('No commands array found in JSON');
        return commands;
    }

    json.commands.forEach(cmd => {
        if (cmd.commandType === 'configureForVolume') {
            currentConfigVolume = cmd.params.volume;
        }
        else if (cmd.commandType === 'aspirate') {
            currentPair = {
                aspirate: cmd.params.labwareId,
                aspVolume: cmd.params.volume,
                aspWell: cmd.params.wellName,
                configVolume: currentConfigVolume,
                aspDisplayName: getLabwareDisplayName(cmd.params.labwareId)
            };
        } else if (cmd.commandType === 'dispense' && Object.keys(currentPair).length > 0) {
            currentPair.dispense = cmd.params.labwareId;
            currentPair.dispVolume = cmd.params.volume;
            currentPair.dispWell = cmd.params.wellName;
            currentPair.dispDisplayName = getLabwareDisplayName(cmd.params.labwareId);
            commands.push({...currentPair});
            currentPair = {};
        }
    });
    
    return commands;
}

function displayTable(commands) {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';
    
    commands.forEach(cmd => {
        const row = tbody.insertRow();
        
        // Use the display names instead of raw labware IDs
        row.insertCell().textContent = cmd.aspDisplayName;
        row.insertCell().textContent = cmd.aspVolume;
        row.insertCell().textContent = cmd.aspWell;
        row.insertCell().textContent = cmd.dispDisplayName;
        row.insertCell().textContent = cmd.dispVolume;
        row.insertCell().textContent = cmd.dispWell;
        
        if (cmd.aspVolume !== cmd.dispVolume) {
            row.classList.add('volume-mismatch');
        }
    });
}

function downloadCSV() {
    const rows = [
        ['Aspirate', 'Volume', 'Well', 'Dispense', 'Volume', 'Well']
    ];
    
    document.querySelectorAll('#dataTable tbody tr').forEach(row => {
        const rowData = [];
        row.querySelectorAll('td').forEach(cell => {
            rowData.push(cell.textContent);
        });
        rows.push(rowData);
    });
    
    const timestamp = getFormattedDateTime();
    const csvFileName = `${originalFileName}_${timestamp}.csv`;
    
    const csvContent = rows.map(row => row.join(',')).join('\n');
    downloadFile(csvContent, csvFileName, 'text/csv');
    showAlert('CSV file downloaded successfully');
}

function handleCSVUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csvData = parseCSV(e.target.result);
            if (originalJSON) {
                modifiedJSON = JSON.parse(JSON.stringify(originalJSON)); // Deep copy
                updateJSONWithCSV(csvData);
                document.getElementById('downloadJSON').disabled = false;
                
                // Show preview of changes
                const updatedCommands = parseCommands(modifiedJSON);
                displayTable(updatedCommands);
            }
        } catch (error) {
            console.error('Error processing CSV:', error);
            alert('Error processing CSV file');
        }
    };
    reader.readAsText(file);
}

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const data = [];
    
    // Skip header row and empty lines
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const cells = line.split(',');
            data.push({
                aspirate: cells[0],
                aspVolume: parseFloat(cells[1]),
                aspWell: cells[2],
                dispense: cells[3],
                dispVolume: parseFloat(cells[4]),
                dispWell: cells[5]
            });
        }
    }
    
    return data;
}

function updateJSONWithCSV(csvData) {
    if (!modifiedJSON) return;
    
    // Update commands array
    let csvIndex = 0;
    let lastAspirateVolume = null;
    
    // First update the savedStepForms
    if (modifiedJSON.designerApplication?.data?.savedStepForms) {
        const stepForms = modifiedJSON.designerApplication.data.savedStepForms;
        
        // Skip the INITIAL_DECK_SETUP_STEP
        for (let stepId in stepForms) {
            if (stepId === '__INITIAL_DECK_SETUP_STEP__') continue;
            
            const step = stepForms[stepId];
            if (step.stepType === 'moveLiquid') {
                // Find corresponding CSV data
                const wellIndex = csvData.findIndex(data => 
                    data.aspWell === step.aspirate_wells[0] && 
                    data.dispWell === step.dispense_wells[0]
                );
                
                if (wellIndex !== -1) {
                    // Update the volume in savedStepForms
                    step.volume = csvData[wellIndex].aspVolume.toString();
                }
            }
        }
    }

    // Then update the commands array
    modifiedJSON.commands.forEach(cmd => {
        if (cmd.commandType === 'configureForVolume') {
            if (csvIndex < csvData.length) {
                cmd.params.volume = csvData[csvIndex].aspVolume;
            }
        }
        else if (cmd.commandType === 'aspirate') {
            if (csvIndex < csvData.length) {
                lastAspirateVolume = csvData[csvIndex].aspVolume;
                cmd.params.volume = lastAspirateVolume;
            }
        }
        else if (cmd.commandType === 'dispense') {
            if (csvIndex < csvData.length) {
                cmd.params.volume = csvData[csvIndex].dispVolume;
                
                // Update the previous configureForVolume if volumes are different
                if (lastAspirateVolume !== cmd.params.volume) {
                    const prevCommands = modifiedJSON.commands.slice(0, modifiedJSON.commands.indexOf(cmd));
                    const lastConfig = prevCommands.reverse().find(c => c.commandType === 'configureForVolume');
                    if (lastConfig) {
                        lastConfig.params.volume = cmd.params.volume;
                    }
                }
                
                csvIndex++;
            }
        }
    });

    // Display preview of updated data
    displayTable(parseCommands(modifiedJSON));
}

function downloadUpdatedJSON() {
    if (!modifiedJSON) return;
    
    const timestamp = getFormattedDateTime();
    const newFileName = `${originalFileName}_update_${timestamp}.json`;
    
    const jsonString = JSON.stringify(modifiedJSON, null, 2);
    downloadFile(jsonString, newFileName, 'application/json');
    showAlert('Updated protocol JSON downloaded successfully');
}

function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function getFormattedDateTime() {
    const now = new Date();
    
    // Get date components
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    
    // Get time components
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${day}${month}${year}_${hours}_${minutes}_${seconds}`;
} 