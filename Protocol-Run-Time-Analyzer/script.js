document.getElementById('jsonFileInput').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const jsonData = JSON.parse(e.target.result);
                console.log('Full JSON data:', jsonData);
                displayProtocolInfo(jsonData);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                alert('Error parsing JSON file. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
}

// Global labware mapping
const globalLabwareMap = new Map();

function mapLabwareIds(data) {
    // Clear previous mappings
    globalLabwareMap.clear();
    
    // Get labware data from the correct path
    const labware = data.data?.labware || [];
    
    // Debug log the raw labware data
    console.log('Raw labware data:', labware);
    
    // Iterate through the labware array
    labware.forEach(item => {
        if (item.id && item.loadName && item.location) {
            globalLabwareMap.set(item.id, {
                name: item.loadName,
                slot: item.location.slotName || 'Unknown slot',
                displayName: item.displayName
            });
        }
    });
    
    // Debug log the final map
    console.log('Labware Map after population:', Object.fromEntries(globalLabwareMap));
}

function getLabwareInfo(labwareId) {
    console.log('Looking up labware ID:', labwareId); // Debug log
    const labware = globalLabwareMap.get(labwareId);
    console.log('Found labware:', labware); // Debug log
    if (labware) {
        return `${labware.name} (${labware.slot})`;
    }
    return labwareId; // Return original ID if not found
}

function findLabwareIdInString(text) {
    // Look for UUID pattern in the text
    const uuidPattern = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;
    const match = text.match(uuidPattern);
    if (match) {
        const labwareId = match[0];
        console.log('Found UUID in string:', labwareId); // Debug log
        if (globalLabwareMap.has(labwareId)) {
            const labwareInfo = getLabwareInfo(labwareId);
            return text.replace(labwareId, labwareInfo);
        }
    }
    return text;
}

function formatParameters(params, pipetteMap) {
    if (!params) return '';

    const parts = [];
    
    // Process each parameter
    for (const [key, value] of Object.entries(params)) {
        // Skip null, empty objects, and wellLocation object
        if (value === null || 
            (typeof value === 'object' && Object.keys(value).length === 0) ||
            key === 'wellLocation') {
            continue;
        }

        let formattedValue = value;
        let formattedKey = key.replace(/([A-Z])/g, ' $1').toLowerCase();

        // Handle special cases
        if (key === 'labwareId') {
            formattedKey = 'Labware';
            console.log('Processing labwareId:', value); // Debug log
            formattedValue = getLabwareInfo(value);
        }
        else if (key === 'pipetteId' && pipetteMap[value]) {
            formattedValue = pipetteMap[value];
            formattedKey = 'Pipette';
        } 
        else if (key === 'wellName') {
            formattedKey = 'Well';
            formattedValue = `<span style="background-color: #FFFF00">${value}</span>`;
        }
        else if (key === 'volume') {
            formattedKey = 'Volume';
            formattedValue = `<span style="background-color: #FFFF00">${value}</span>`;
        }
        else if (key === 'flowRate') {
            formattedKey = 'Flow Rate';
        }
        else if (typeof value === 'string') {
            // Check if the value is a labware ID
            formattedValue = findLabwareIdInString(value);
        }

        parts.push(`${formattedKey}: ${formattedValue}`);
    }

    return parts.join(' | ');
}

function displayProtocolInfo(data) {
    try {
        // Initialize labware mapping
        mapLabwareIds(data);

        // Display basic protocol information
        document.getElementById('protocolName').textContent = data.data?.metadata?.protocolName || 'Untitled';
        document.getElementById('creationDate').textContent = new Date(data.data?.createdAt).toLocaleString();
        document.getElementById('status').textContent = data.data?.status || 'Unknown';

        // Handle commands
        let commands = [];
        if (data.commands?.data) {
            commands = data.commands.data;
        }
        
        document.getElementById('totalSteps').textContent = commands.length;

        // Calculate total time
        const totalTime = calculateTotalTime(commands);
        document.getElementById('totalTime').textContent = formatDuration(totalTime);

        // Display pipette information
        const pipettes = data.data?.pipettes || [];
        const pipetteHtml = pipettes.map(pipette => {
            return `<div class="mb-2">
                <strong>${pipette.pipetteName}</strong> (${pipette.mount} mount)
                ${pipette.id ? `<br>ID: ${pipette.id}` : ''}
            </div>`;
        }).join('');
        document.getElementById('pipetteInfo').innerHTML = pipetteHtml || 'No pipettes found';

        // Display labware information using global mapping
        const labwareHtml = Array.from(globalLabwareMap.entries()).map(([id, lab]) => {
            return `<div class="mb-2">
                <strong>${lab.name}</strong> in slot ${lab.slot}
                ${lab.displayName ? `<br>(${lab.displayName})` : ''}
            </div>`;
        }).join('');
        document.getElementById('labwareInfo').innerHTML = labwareHtml || 'No labware found';

        // Display runtime parameters
        displayRuntimeParameters(data.data?.runTimeParameters || []);

        // Display commands table
        displayCommandsTable(commands, pipettes);
    } catch (error) {
        console.error('Error displaying protocol info:', error);
        alert('Error displaying protocol information. Please check the console for details.');
    }
}

function displayRuntimeParameters(parameters) {
    const tbody = document.getElementById('runtimeParamsBody');
    tbody.innerHTML = '';

    parameters.forEach(param => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = param.variableName || '';
        row.insertCell(1).textContent = param.displayName || '';
        row.insertCell(2).textContent = param.value || '';
        row.insertCell(3).textContent = param.default || '';
        row.insertCell(4).textContent = param.description || '';
    });
}

function getCommandColor(commandType) {
    const colors = {
        'pickUpTip': '#FFA500',  // Orange
        'aspirate': '#0000FF',   // Blue
        'dispense': '#008000',   // Green
        'dropTip': '#FF0000'     // Red
    };
    return colors[commandType] || '#000000'; // Default to black
}

function displayCommandsTable(commands, pipettes) {
    const tableBody = document.getElementById('commandTableBody');
    tableBody.innerHTML = '';
    
    // Create pipette lookup map
    const pipetteMap = {};
    pipettes.forEach(pipette => {
        pipetteMap[pipette.id] = pipette.pipetteName;
    });

    commands.forEach(cmd => {
        const row = document.createElement('tr');
        
        // Command Type with color
        const cmdType = document.createElement('td');
        cmdType.textContent = cmd.commandType || '-';
        cmdType.style.color = getCommandColor(cmd.commandType);
        cmdType.style.fontWeight = 'bold';
        row.appendChild(cmdType);

        // Parameters/Message
        const params = document.createElement('td');
        if (cmd.commandType === 'comment') {
            params.textContent = cmd.params?.message || '';
        } else {
            params.innerHTML = formatParameters(cmd.params, pipetteMap);
        }
        row.appendChild(params);

        // Started At
        const started = document.createElement('td');
        started.textContent = cmd.startedAt ? new Date(cmd.startedAt).toLocaleString() : '-';
        row.appendChild(started);

        // Completed At
        const completed = document.createElement('td');
        completed.textContent = cmd.completedAt ? new Date(cmd.completedAt).toLocaleString() : '-';
        row.appendChild(completed);

        // Duration
        const duration = document.createElement('td');
        if (cmd.startedAt && cmd.completedAt) {
            const durationMs = new Date(cmd.completedAt) - new Date(cmd.startedAt);
            duration.textContent = formatDuration(durationMs);
        } else {
            duration.textContent = '-';
        }
        row.appendChild(duration);

        tableBody.appendChild(row);
    });
}

function calculateTotalTime(commands) {
    let totalTime = 0;
    commands.forEach(cmd => {
        if (cmd.startedAt && cmd.completedAt) {
            totalTime += new Date(cmd.completedAt) - new Date(cmd.startedAt);
        }
    });
    return totalTime;
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
} 