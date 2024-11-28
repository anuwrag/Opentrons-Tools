class LabwareCreator {
    constructor() {
        this.canvas = document.getElementById('previewCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.downloadButton = document.getElementById('downloadJson');
        this.wellData = null; // Store uploaded CSV data
        this.setupEventListeners();
        this.updatePreview();
        this.setupFormatTypeListener();
    }

    setupEventListeners() {
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updatePreview();
                this.updateWellDimensionsVisibility();
            });
        });

        document.getElementById('generateJson').addEventListener('click', () => {
            this.generateLabwareDefinition();
            const downloadButton = document.getElementById('downloadJson');
            downloadButton.disabled = false;
            downloadButton.classList.remove('btn-secondary', 'disabled');
            downloadButton.classList.add('btn-success');
        });

        this.downloadButton.addEventListener('click', () => {
            this.downloadLabwareDefinition();
        });
    }

    setupFormatTypeListener() {
        const formatType = document.getElementById('formatType');
        const irregularControls = document.getElementById('irregularControls');
        const wellConfigInputs = document.querySelectorAll('#wellDimensions input, #volume, #wellShape, #bottomShape, #depth');
        
        formatType.addEventListener('change', () => {
            const isIrregular = formatType.value === 'irregular';
            irregularControls.style.display = isIrregular ? 'block' : 'none';
            wellConfigInputs.forEach(input => {
                input.disabled = isIrregular;
            });
        });

        // Add CSV download handler
        document.getElementById('downloadCsv').addEventListener('click', () => this.downloadCsvTemplate());
        
        // Add CSV upload handler
        document.getElementById('csvFile').addEventListener('change', (e) => this.handleCsvUpload(e));
    }

    downloadCsvTemplate() {
        const rows = parseInt(document.getElementById('rows').value);
        const cols = parseInt(document.getElementById('columns').value);
        let csvContent = "well,depth,totalLiquidVolume,shape,x,y,z,diameter\n";
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const wellName = String.fromCharCode(65 + row) + (col + 1);
                csvContent += `${wellName},,,circular,,,0,\n`;
            }
        }

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'well_configuration_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async handleCsvUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const text = await file.text();
        const rows = text.split('\n');
        const headers = rows[0].split(',');
        
        this.wellData = {};
        rows.slice(1).forEach(row => {
            if (!row.trim()) return;
            const values = row.split(',');
            const wellName = values[0];
            this.wellData[wellName] = {
                depth: parseFloat(values[1]),
                totalLiquidVolume: parseFloat(values[2]),
                shape: values[3],
                x: parseFloat(values[4]),
                y: parseFloat(values[5]),
                z: parseFloat(values[6]),
                diameter: parseFloat(values[7])
            };
        });

        // Update preview after CSV upload
        this.updatePreview();
    }

    updateWellDimensionsVisibility() {
        const wellShape = document.getElementById('wellShape').value;
        const diameter = document.getElementById('diameter');
        const wellWidth = document.getElementById('wellWidth');
        const wellLength = document.getElementById('wellLength');

        if (wellShape === 'circular') {
            diameter.style.display = 'block';
            wellWidth.style.display = 'none';
            wellLength.style.display = 'none';
        } else {
            diameter.style.display = 'none';
            wellWidth.style.display = 'block';
            wellLength.style.display = 'block';
        }
    }

    updatePreview() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const isIrregular = document.getElementById('formatType').value === 'irregular';
        
        // Draw plate outline
        const plateLength = parseInt(document.getElementById('length').value);
        const plateWidth = parseInt(document.getElementById('width').value);
        const scale = Math.min(
            this.canvas.width / (plateLength * 1.2),
            this.canvas.height / (plateWidth * 1.2)
        );

        ctx.strokeRect(50, 50, plateLength * scale, plateWidth * scale);

        if (isIrregular && this.wellData) {
            // Draw wells from CSV data
            Object.entries(this.wellData).forEach(([wellName, well]) => {
                if (well.shape === 'circular' && well.diameter) {
                    ctx.beginPath();
                    ctx.arc(
                        50 + well.x * scale,
                        50 + well.y * scale,
                        well.diameter / 2 * scale,
                        0,
                        2 * Math.PI
                    );
                    ctx.stroke();
                } else if (well.shape === 'rectangular' && well.xDimension && well.yDimension) {
                    ctx.strokeRect(
                        50 + well.x * scale - (well.xDimension / 2 * scale),
                        50 + well.y * scale - (well.yDimension / 2 * scale),
                        well.xDimension * scale,
                        well.yDimension * scale
                    );
                }
            });
        } else {
            // Original preview code for standard format
            const rows = parseInt(document.getElementById('rows').value);
            const cols = parseInt(document.getElementById('columns').value);
            const wellShape = document.getElementById('wellShape').value;

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const x = 50 + (col * parseInt(document.getElementById('xSpacing').value) + 
                        parseInt(document.getElementById('xOffset').value)) * scale;
                    const y = 50 + (row * parseInt(document.getElementById('ySpacing').value) + 
                        parseInt(document.getElementById('yOffset').value)) * scale;

                    if (wellShape === 'circular') {
                        ctx.beginPath();
                        ctx.arc(x, y, parseInt(document.getElementById('diameter').value) / 2 * scale, 0, 2 * Math.PI);
                        ctx.stroke();
                    } else {
                        const wellWidth = parseInt(document.getElementById('wellWidth').value) * scale;
                        const wellLength = parseInt(document.getElementById('wellLength').value) * scale;
                        ctx.strokeRect(x - wellWidth/2, y - wellLength/2, wellWidth, wellLength);
                    }
                }
            }
        }
    }

    generateLabwareDefinition() {
        // Determine correct format based on grid layout
        const rows = parseInt(document.getElementById('rows').value);
        const cols = parseInt(document.getElementById('columns').value);
        let format;
        if (rows === 8 && cols === 12) {
            format = '96Standard';
        } else if (rows === 16 && cols === 24) {
            format = '384Standard';
        } else if (document.getElementById('displayCategory').value === 'trough') {
            format = 'trough';
        } else {
            format = 'irregular';
        }

        const options = {
            namespace: 'custom_beta',
            metadata: {
                displayName: document.getElementById('displayName').value,
                displayCategory: document.getElementById('displayCategory').value,
                displayVolumeUnits: 'µL',
                tags: [],
            },
            parameters: {
                format: format,
                isTiprack: document.getElementById('displayCategory').value === 'tipRack',
                isMagneticModuleCompatible: false,
                loadName: document.getElementById('loadName').value.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
            },
            dimensions: {
                xDimension: parseFloat(document.getElementById('length').value),
                yDimension: parseFloat(document.getElementById('width').value),
                zDimension: parseFloat(document.getElementById('height').value),
            },
            offset: {
                x: parseFloat(document.getElementById('xOffset').value),
                y: parseFloat(document.getElementById('yOffset').value),
                z: parseFloat(document.getElementById('height').value), // Z offset should be same as height
            },
            grid: {
                row: parseInt(document.getElementById('rows').value),
                column: parseInt(document.getElementById('columns').value),
            },
            spacing: {
                row: parseFloat(document.getElementById('ySpacing').value),
                column: parseFloat(document.getElementById('xSpacing').value),
            },
            well: {
                depth: parseFloat(document.getElementById('depth').value),
                shape: document.getElementById('wellShape').value,
                diameter: document.getElementById('wellShape').value === 'circular' ? 
                    parseFloat(document.getElementById('diameter').value) : undefined,
                xDimension: document.getElementById('wellShape').value === 'rectangular' ? 
                    parseFloat(document.getElementById('wellWidth').value) : undefined,
                yDimension: document.getElementById('wellShape').value === 'rectangular' ? 
                    parseFloat(document.getElementById('wellLength').value) : undefined,
                totalLiquidVolume: parseFloat(document.getElementById('volume').value),
            },
            brand: {
                brand: document.getElementById('brand').value || 'generic',
                brandId: [document.getElementById('catalogNumber').value],
            },
            group: {
                metadata: {
                    wellBottomShape: document.getElementById('bottomShape').value,
                },
            },
        };

        // Generate the definition using their format
        const definition = this.createRegularLabware(options);
        
        document.getElementById('jsonOutput').textContent = 
            JSON.stringify(definition, null, 2);
    }

    createRegularLabware(options) {
        // This is a simplified version of their creator
        return {
            schemaVersion: 2,
            version: 1,
            namespace: options.namespace,
            metadata: options.metadata,
            dimensions: options.dimensions,
            parameters: options.parameters,
            brand: options.brand,
            ordering: this.generateOrdering(),
            wells: this.generateWellsFromOptions(options),
            groups: [{
                metadata: {
                    ...options.group.metadata,
                    displayName: options.metadata.displayName,
                    displayCategory: options.metadata.displayCategory,
                },
                brand: options.brand,
                wells: this.generateWellsList()
            }],
            cornerOffsetFromSlot: { x: 0, y: 0, z: 0 },
        };
    }

    generateWellsFromOptions(options) {
        if (document.getElementById('formatType').value === 'irregular' && this.wellData) {
            return this.wellData;
        }

        const wells = {};
        const { grid, spacing, offset, well } = options;
        const plateHeight = parseFloat(document.getElementById('height').value);
        const plateLength = parseFloat(document.getElementById('length').value);
        const plateWidth = parseFloat(document.getElementById('width').value);
        
        for (let row = 0; row < grid.row; row++) {
            for (let col = 0; col < grid.column; col++) {
                const wellName = String.fromCharCode(65 + row) + (col + 1);
                wells[wellName] = {
                    depth: well.depth,
                    totalLiquidVolume: well.totalLiquidVolume,
                    shape: well.shape,
                    x: col * spacing.column + offset.x,
                    y: row * spacing.row + offset.y,
                    z: plateHeight - well.depth,
                    ...(well.shape === 'circular' ? { diameter: well.diameter } : 
                       { xDimension: well.xDimension, yDimension: well.yDimension })
                };

                if (wells[wellName].x > plateLength || wells[wellName].y > plateWidth) {
                    console.warn(`Well ${wellName} position exceeds plate dimensions`);
                }
            }
        }
        return wells;
    }

    generateOrdering() {
        const rows = parseInt(document.getElementById('rows').value);
        const cols = parseInt(document.getElementById('columns').value);
        const ordering = [];
        
        for (let col = 1; col <= cols; col++) {
            const column = [];
            for (let row = 0; row < rows; row++) {
                const wellName = `${String.fromCharCode(65 + row)}${col}`;
                column.push(wellName);
            }
            ordering.push(column);
        }
        return ordering;
    }

    generateWellsList() {
        const rows = parseInt(document.getElementById('rows').value);
        const cols = parseInt(document.getElementById('columns').value);
        const wells = [];
        
        for (let col = 1; col <= cols; col++) {
            for (let row = 0; row < rows; row++) {
                wells.push(`${String.fromCharCode(65 + row)}${col}`);
            }
        }
        return wells;
    }

    determineFormat() {
        const rows = parseInt(document.getElementById('rows').value);
        const cols = parseInt(document.getElementById('columns').value);
        return `${rows}x${cols}`;
    }

    downloadLabwareDefinition() {
        const jsonContent = document.getElementById('jsonOutput').textContent;
        if (!jsonContent) return;

        const loadName = document.getElementById('loadName').value || 'custom_labware';
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${loadName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Additional helper methods would go here...
}

// Initialize the creator when the page loads
window.addEventListener('load', () => {
    new LabwareCreator();
});