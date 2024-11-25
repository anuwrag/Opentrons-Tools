$(document).ready(function() {
    let selectedWells = [];

    $('#plateFormat').change(function() {
        generatePlate($(this).val());
    });

    function generatePlate(format) {
        let [cols, rows] = format.split('x').map(Number);
        let plateHTML = '<div class="plate">';

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                plateHTML += `<div class="well" data-row="${row}" data-col="${col}"></div>`;
            }
        }

        plateHTML += '</div>';
        $('#plateContainer').html(plateHTML);

        $('.well').click(function() {
            $(this).toggleClass('selected');
            updateCodeBlock();
        });
    }

    function updateCodeBlock() {
        selectedWells = [];
        $('.well.selected').each(function() {
            let row = $(this).data('row');
            let col = $(this).data('col');
            selectedWells.push({ row, col });
        });

        let code = generateOpentronsCode(selectedWells);
        $('#codeBlock').text(code);
    }

    function generateOpentronsCode(wells) {
        // Logic to generate Opentrons code based on selectedWells
        // This will be complex and depend on your specific requirements
        // You'll likely need to handle individual wells, rows, columns, etc.
        let code = ''; 

        if (wells.length === 1) {
            let { row, col } = wells[0];
            code = `wells_list = plate.wells()[${row * 12 + col}]`; // Assuming 12-column plate
        } else if (/* Check for a full row */) {
            // ...
        } else if (/* Check for a full column */) {
            // ...
        } else {
            // ... handle more complex selections
        }

        return code;
    }

    // Initial plate generation
    generatePlate($('#plateFormat').val());
});
