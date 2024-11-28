class LabwareCreator {
    constructor() {
        // Initialize canvas elements
        this.canvas = document.getElementById('previewCanvas');
        if (!this.canvas) {
            console.error('2D preview canvas not found');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize other elements
        this.downloadButton = document.getElementById('downloadJson');
        this.wellData = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // Check if 3D preview container exists
        if (!document.getElementById('preview3d')) {
            console.error('3D preview container not found');
            return;
        }

        // Setup in correct order
        this.setupEventListeners();
        this.setupFormatTypeListener();
        this.setup3DPreview();
        this.updatePreview(); // Initial render of both previews
    }

    updatePreview() {
        // Update both previews
        if (this.ctx) {
            this.update2DPreview();
        }
        if (this.scene && this.camera && this.renderer) {
            this.update3DPreview();
        }
    }

    update2DPreview() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const isIrregular = document.getElementById('formatType').value === 'irregular';
        
        // Draw plate outline
        const plateLength = parseFloat(document.getElementById('length').value);
        const plateWidth = parseFloat(document.getElementById('width').value);
        const scale = Math.min(
            this.canvas.width / (plateLength * 1.2),
            this.canvas.height / (plateWidth * 1.2)
        );

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
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
                }
            });
        } else {
            // Draw standard format wells
            const rows = parseInt(document.getElementById('rows').value);
            const cols = parseInt(document.getElementById('columns').value);
            const wellShape = document.getElementById('wellShape').value;
            const xSpacing = parseFloat(document.getElementById('xSpacing').value);
            const ySpacing = parseFloat(document.getElementById('ySpacing').value);
            const xOffset = parseFloat(document.getElementById('xOffset').value);
            const yOffset = parseFloat(document.getElementById('yOffset').value);

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const x = 50 + (xOffset + col * xSpacing) * scale;
                    const y = 50 + (yOffset + row * ySpacing) * scale;

                    if (wellShape === 'circular') {
                        const diameter = parseFloat(document.getElementById('diameter').value);
                        ctx.beginPath();
                        ctx.arc(x, y, diameter / 2 * scale, 0, 2 * Math.PI);
                        ctx.stroke();
                    } else {
                        const wellWidth = parseFloat(document.getElementById('wellWidth').value) * scale;
                        const wellLength = parseFloat(document.getElementById('wellLength').value) * scale;
                        ctx.strokeRect(x - wellWidth/2, y - wellLength/2, wellWidth, wellLength);
                    }
                }
            }
        }
    }

    setupEventListeners() {
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updatePreview();
                this.updateWellDimensionsVisibility();
            });
            input.addEventListener('input', () => {
                this.updatePreview();
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

        // Handle window resize for 3D preview
        window.addEventListener('resize', () => {
            if (this.camera && this.renderer) {
                this.camera.aspect = document.getElementById('preview3d').clientWidth / document.getElementById('preview3d').clientHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(
                    document.getElementById('preview3d').clientWidth,
                    document.getElementById('preview3d').clientHeight
                );
            }
        });
    }

    setupFormatTypeListener() {
        const formatType = document.getElementById('formatType');
        const irregularControls = document.getElementById('irregularControls');
        const wellConfigInputs = document.querySelectorAll('#wellDimensions input, #volume, #bottomShape, #depth');
        const wellShape = document.getElementById('wellShape');
        
        formatType.addEventListener('change', () => {
            const isIrregular = formatType.value === 'irregular';
            irregularControls.style.display = isIrregular ? 'block' : 'none';
            
            // Keep well shape enabled for irregular format
            wellConfigInputs.forEach(input => {
                if (input.id !== 'wellShape') {
                    input.disabled = isIrregular;
                }
            });
            
            // Keep well shape enabled
            wellShape.disabled = false;
        });

        // Add CSV download handler
        document.getElementById('downloadCsv').addEventListener('click', () => this.downloadCsvTemplate());
        
        // Add CSV upload handler
        document.getElementById('csvFile').addEventListener('change', (e) => this.handleCsvUpload(e));
    }

    downloadCsvTemplate() {
        const wellShape = document.getElementById('wellShape').value;
        const rows = parseInt(document.getElementById('rows').value);
        const cols = parseInt(document.getElementById('columns').value);
        const depth = document.getElementById('depth').value;
        const volume = document.getElementById('volume').value;
        
        // Define headers
        let headers = ['well_name', 'depth', 'total_liquid_volume', 'shape', 'x', 'y', 'z'];
        if (wellShape === 'circular') {
            headers.push('diameter');
        } else if (wellShape === 'rectangular') {
            headers.push('xDimension', 'yDimension');
        }
        
        // Create CSV content starting with headers
        let csvContent = headers.join(',') + '\n';
        
        // Get spacing and offset values
        const xSpacing = parseFloat(document.getElementById('xSpacing').value);
        const ySpacing = parseFloat(document.getElementById('ySpacing').value);
        const xOffset = parseFloat(document.getElementById('xOffset').value);
        const yOffset = parseFloat(document.getElementById('yOffset').value);
        const plateHeight = parseFloat(document.getElementById('height').value);
        
        // Generate rows for each well
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const wellName = String.fromCharCode(65 + row) + (col + 1);
                const x = xOffset + (col * xSpacing);
                const y = yOffset + (row * ySpacing);
                const z = plateHeight - parseFloat(depth);
                
                let wellRow = [
                    wellName,
                    depth,
                    volume,
                    wellShape,
                    x.toFixed(2),
                    y.toFixed(2),
                    z.toFixed(2)
                ];
                
                // Add shape-specific measurements
                if (wellShape === 'circular') {
                    wellRow.push(document.getElementById('diameter').value);
                } else if (wellShape === 'rectangular') {
                    wellRow.push(
                        document.getElementById('wellWidth').value,
                        document.getElementById('wellLength').value
                    );
                }
                
                csvContent += wellRow.join(',') + '\n';
            }
        }
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'labware_template.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    handleCsvUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            const rows = text.split('\n');
            const headers = rows[0].toLowerCase().split(',');
            
            this.wellData = {};
            rows.slice(1).forEach(row => {
                if (!row.trim()) return;
                const values = row.split(',');
                const wellName = values[0];
                const wellShape = values[3];
                
                const wellData = {
                    depth: parseFloat(values[1]),
                    totalLiquidVolume: parseFloat(values[2]),
                    shape: wellShape,
                    x: parseFloat(values[4]),
                    y: parseFloat(values[5]),
                    z: parseFloat(values[6])
                };

                // Add shape-specific parameters based on the shape in CSV
                if (wellShape === 'circular') {
                    wellData.diameter = parseFloat(values[7]);
                } else if (wellShape === 'rectangular') {
                    wellData.xDimension = parseFloat(values[7]);
                    wellData.yDimension = parseFloat(values[8]);
                }

                this.wellData[wellName] = wellData;
            });

            // Update well shape dropdown to match CSV
            const firstWellShape = Object.values(this.wellData)[0]?.shape;
            if (firstWellShape) {
                document.getElementById('wellShape').value = firstWellShape;
                this.updateWellDimensionsVisibility();
            }

            this.updatePreview();
        };
        reader.readAsText(file);
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

    setup3DPreview() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf8f9fa);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            45, // Reduced FOV for less perspective distortion
            document.getElementById('preview3d').clientWidth / document.getElementById('preview3d').clientHeight,
            0.1,
            2000
        );

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(
            document.getElementById('preview3d').clientWidth,
            document.getElementById('preview3d').clientHeight
        );
        document.getElementById('preview3d').appendChild(this.renderer.domElement);

        // Add controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = true; // Better panning behavior for top view

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(directionalLight);

        // Add reset view button handler
        document.getElementById('resetView').addEventListener('click', () => {
            this.resetView();
        });

        // Start animation loop
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    resetView() {
        const plateLength = parseFloat(document.getElementById('length').value);
        const plateWidth = parseFloat(document.getElementById('width').value);
        const maxDimension = Math.max(plateLength, plateWidth) * 1.2;
        
        this.camera.position.set(plateLength/2, maxDimension, plateWidth/2);
        this.camera.lookAt(plateLength/2, 0, plateWidth/2);
        this.camera.up.set(0, 0, -1);
        this.controls.target.set(plateLength/2, 0, plateWidth/2);
        this.controls.update();
    }

    update3DPreview() {
        // Clear existing objects
        while(this.scene.children.length > 0) { 
            this.scene.remove(this.scene.children[0]); 
        }

        // Add lights back
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(directionalLight);

        // Create plate
        const plateLength = parseFloat(document.getElementById('length').value);
        const plateWidth = parseFloat(document.getElementById('width').value);
        const plateHeight = parseFloat(document.getElementById('height').value);
        
        // Create plate with edges
        const plateGeometry = new THREE.BoxGeometry(plateLength, plateHeight, plateWidth);
        const plateMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xcccccc,
            transparent: true,
            opacity: 0.5
        });
        const plate = new THREE.Mesh(plateGeometry, plateMaterial);
        
        // Add black edges to plate
        const plateEdges = new THREE.EdgesGeometry(plateGeometry);
        const plateLines = new THREE.LineSegments(
            plateEdges,
            new THREE.LineBasicMaterial({ color: 0x000000 })
        );
        
        plate.position.set(plateLength/2, plateHeight/2, plateWidth/2);
        plateLines.position.copy(plate.position);
        
        this.scene.add(plate);
        this.scene.add(plateLines);

        const isIrregular = document.getElementById('formatType').value === 'irregular';

        if (isIrregular && this.wellData) {
            // Add wells from CSV data
            Object.entries(this.wellData).forEach(([wellName, well]) => {
                if (well.shape === 'circular') {
                    const wellGroup = this.createWellWithOutline(
                        well.diameter,
                        well.depth,
                        well.x,
                        plateHeight - well.depth / 2,
                        well.y
                    );
                    this.scene.add(wellGroup);
                }
            });
        } else {
            // Add standard format wells
            const rows = parseInt(document.getElementById('rows').value);
            const cols = parseInt(document.getElementById('columns').value);
            const wellShape = document.getElementById('wellShape').value;
            const xSpacing = parseFloat(document.getElementById('xSpacing').value);
            const ySpacing = parseFloat(document.getElementById('ySpacing').value);
            const xOffset = parseFloat(document.getElementById('xOffset').value);
            const yOffset = parseFloat(document.getElementById('yOffset').value);
            const wellDepth = parseFloat(document.getElementById('depth').value);

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    if (wellShape === 'circular') {
                        const diameter = parseFloat(document.getElementById('diameter').value);
                        const wellGroup = this.createWellWithOutline(
                            diameter,
                            wellDepth,
                            xOffset + col * xSpacing,
                            plateHeight - wellDepth / 2,
                            yOffset + row * ySpacing
                        );
                        this.scene.add(wellGroup);
                    }
                }
            }
        }

        this.resetView();
    }

    createWellWithOutline(diameter, depth, x, y, z) {
        const group = new THREE.Group();

        // Create well cylinder
        const wellGeometry = new THREE.CylinderGeometry(
            diameter / 2,
            diameter / 2,
            depth,
            32
        );
        const wellMaterial = new THREE.MeshPhongMaterial({ color: 0x2196f3 });
        const wellMesh = new THREE.Mesh(wellGeometry, wellMaterial);

        // Create outline for the top circle
        const circleGeometry = new THREE.CircleGeometry(diameter / 2, 32);
        const edgesGeometry = new THREE.EdgesGeometry(circleGeometry);
        const outline = new THREE.LineSegments(
            edgesGeometry,
            new THREE.LineBasicMaterial({ color: 0x000000 })
        );

        // Position well and outline
        wellMesh.position.set(x, y, z);
        outline.position.set(x, y + depth/2, z);
        outline.rotation.x = -Math.PI / 2; // Rotate to lay flat

        group.add(wellMesh);
        group.add(outline);

        return group;
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
        const plateWidth = parseFloat(document.getElementById('width').value);
        
        for (let row = 0; row < grid.row; row++) {
            for (let col = 0; col < grid.column; col++) {
                const wellName = String.fromCharCode(65 + row) + (col + 1);
                const wellShape = document.getElementById('wellShape').value;
                
                const wellData = {
                    depth: well.depth,
                    totalLiquidVolume: well.totalLiquidVolume,
                    shape: wellShape,
                    x: offset.x + (col * spacing.column),
                    y: offset.y + (row * spacing.row),
                    z: plateHeight - well.depth
                };

                // Add shape-specific parameters
                if (wellShape === 'circular') {
                    wellData.diameter = parseFloat(document.getElementById('diameter').value);
                } else if (wellShape === 'rectangular') {
                    wellData.xDimension = parseFloat(document.getElementById('wellWidth').value);
                    wellData.yDimension = parseFloat(document.getElementById('wellLength').value);
                }

                wells[wellName] = wellData;
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
window.addEventListener('DOMContentLoaded', () => {
    new LabwareCreator();
});