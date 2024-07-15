function translateAndVisualize(protocolData) {
    const canvas = document.getElementById("deckCanvas");
    const ctx = canvas.getContext("2d");
  
    const offset_x = 70;
    const offset_y = 70;
  
    function transform_coord(x, y) {
      return [x + offset_x, canvas.height - y - offset_y];
    }
  
    function split_by_length(text, max_length = 10) {
      const words = text.split();
      const lines = [];
      let current_line = "";
  
      for (const word of words) {
        if (current_line.length + word.length + 1 > max_length) {
          lines.push(current_line.trim());
          current_line = word;
        } else {
          current_line += " " + word;
        }
      }
      lines.push(current_line.trim());
  
      return lines.join("\n");
    }
  
    function ch(data) {
      const pip_ch = {};
      for (let i = 0; i < 2; i++) {
        try {
          const ids = data['pipettes'][i]['id'];
          const alpha = data['pipettes'][i]['pipetteName'].split("_")[1][0];
          const channels = alpha === 's' ? 1 : alpha === 'm' ? 8 : 96;
          pip_ch[ids] = channels;
        } catch (error) {}
      }
      return pip_ch;
    }
  
    const pip_ch = ch(protocolData);
    const robo = protocolData['robotType'][:4];
    const slotDataOT3 = [
        ["D1", [0.0, 0.0], [128.0, 86.0]],
        ["D2", [164.0, 0.0], [292.0, 86.0]],
        ["D3", [328.0, 0.0], [456.0, 86.0]],
        ["C1", [0.0, 107.0], [128.0, 193.0]],
        ["C2", [164.0, 107.0], [292.0, 193.0]],
        ["C3", [328.0, 107.0], [456.0, 193.0]],
        ["B1", [0.0, 214.0], [128.0, 300.0]],
        ["B2", [164.0, 214.0], [292.0, 300.0]],
        ["B3", [328.0, 214.0], [456.0, 300.0]],
        ["A1", [0.0, 321.0], [128.0, 407.0]],
        ["A2", [164.0, 321.0], [292.0, 407.0]],
        ["A3", [328.0, 321.0], [456.0, 407.0]],
        ["D4", [492.0, 0.0], [620.0, 86.0]],
        ["C4", [492.0, 107.0], [620.0, 193.0]],
        ["B4", [492.0, 214.0], [620.0, 300.0]],
        ["A4", [492.0, 321.0], [620.0, 407.0]]
    ];
  
    const slotDataOT2 = [
        ["1", [0.0, 0.0], [128.0, 86.0]],
        ["2", [132.5, 0.0], [260.5, 86.0]],
        ["3", [265.0, 0.0], [393.0, 86.0]],
        ["4", [0.0, 90.5], [128.0, 176.5]],
        ["5", [132.5, 90.5], [260.5, 176.5]],
        ["6", [265.0, 90.5], [393.0, 176.5]],
        ["7", [0.0, 181.0], [128.0, 267.0]],
        ["8", [132.5, 181.0], [260.5, 267.0]],
        ["9", [265.0, 181.0], [393.0, 267.0]],
        ["10", [0.0, 271.5], [128.0, 357.5]],
        ["11", [132.5, 271.5], [260.5, 357.5]],
        ["12", [265.0, 271.5], [393.0, 357.5]]
    ];
  
    const slot_data = robo === 'OT-3' ? slotDataOT3 : slotDataOT2;
    const labware_dict = {};
    for (const cmd of protocolData["commands"]) {
      if (cmd["commandType"] === "loadLabware") {
        labware_dict[cmd['params']['location']['slotName']] = cmd['result']['definition']['metadata']['displayName'];
      }
    }
  
    const img_height = 450 + offset_y * 2;
    const img_width = 650 + offset_x * 2;
    canvas.height = img_height;
    canvas.width = img_width;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, img_width, img_height);
  
  // Draw rectangles and labels (adapted for Canvas)
  for (const [slot_name, start, end] of slot_data) {
    const [start_x, start_y] = transform_coord(start[0], end[1]);
    const [end_x, end_y] = transform_coord(end[0], start[1]);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(start_x, start_y, end_x - start_x, end_y - start_y);

    ctx.fillStyle = "black";
    ctx.font = "12px sans-serif";
    ctx.fillText(slot_name, start_x - 25, start_y + 66);

    const display_name = split_by_length(labware_dict[slot_name] || 'Empty');
    const text_width = ctx.measureText(display_name).width;
    ctx.fillText(display_name, start_x + (end_x - start_x - text_width) / 2 + 20, end_y + 10);
  }
  
  // Draw circles for aspirated and dispensed wells
  const radius = 3;
  const asp_color = "green"; // Green color
  const disp_color = "teal"; // Teal color
  
  for (const cmd of protocolData["commands"]) {
    if (cmd["commandType"] === "aspirate" || cmd["commandType"] === "dispense") {
      try {
        const pip_channel = pip_ch[cmd['params']['pipetteId']];
        const well_select = { 1: [1, 1], 8: [8, 1], 96: [8, 12] };
        const [col, rows] = well_select[pip_channel];
        const c = cmd['result']['position'];
        const [center_x, center_y] = transform_coord(c['x'], c['y']);

        let x_0 = 0;
        let y_0 = 0;
        for (let c = 0; c < col; c++) {
          for (let r = 0; r < rows; r++) {
            ctx.beginPath();
            ctx.arc(center_x + x_0, center_y + y_0, radius, 0, 2 * Math.PI);
            ctx.fillStyle = cmd["commandType"] === "aspirate" ? asp_color : disp_color;
            ctx.fill();
            y_0 += 9; // Adjust for next well in the column
          }
          x_0 += 9;  // Adjust for next column
          y_0 = 0;  // Reset for the next column
        }
      } catch (error) {}
    }
  }
  
    // ... (Rest of the code for drawing tip pick up locations and calculating tip usage, as provided earlier)
  }
  