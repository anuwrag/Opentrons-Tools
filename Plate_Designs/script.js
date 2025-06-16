function generatePlateSVG(xOffset, yOffset, xSpacing, ySpacing, diameter, rows, cols) {
    const contentWidth = xOffset + (cols - 1) * xSpacing + diameter;
    const contentHeight = yOffset + (rows - 1) * ySpacing + diameter;
    const svgWidth = 3 * contentWidth;
    const svgHeight = 3 * contentHeight;
  
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", svgWidth);
    svg.setAttribute("height", svgHeight);
  
    const scaleX = svgWidth / contentWidth;
    const scaleY = svgHeight / contentHeight;
  
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        const cx = scaleX * (xOffset + j * xSpacing);
        const cy = scaleY * (yOffset + i * ySpacing);
        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", scaleX * (diameter / 2));
        circle.setAttribute("stroke", "black");
        circle.setAttribute("stroke-width", "2");
        circle.setAttribute("fill", "none");
        circle.setAttribute("class", "well");
        circle.setAttribute("data-x", cx);
        circle.setAttribute("data-y", cy);
        svg.appendChild(circle);
      }
    }
  
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", 0);
    rect.setAttribute("y", 0);
    rect.setAttribute("width", svgWidth);
    rect.setAttribute("height", svgHeight);
    rect.setAttribute("rx", 20);
    rect.setAttribute("ry", 20);
    rect.setAttribute("stroke", "black");
    rect.setAttribute("stroke-width", "2");
    rect.setAttribute("fill", "none");
    svg.appendChild(rect);

    const plateText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      plateText.setAttribute("x", svgWidth / 2);
      plateText.setAttribute("y", svgHeight - 0); // Position at the bottom
      plateText.setAttribute("text-anchor", "middle");
      plateText.setAttribute("font-size", "16");
      plateText.textContent = "Plate";
      svg.appendChild(plateText);
    

  
    return svg;
  }
  
  function generatePipetteSVG(channels) {
    const circleDiameter = 6;
    const circleSpacing = 9;
    const offset = 9;
  
    let rows, cols;
    if (channels === 8) {
      rows = 8;
      cols = 1;
    } else if (channels === 96) {
      rows = 8;
      cols = 12;
    } else {
      return null;
    }
  
    const contentWidth = offset + (cols - 1) * circleSpacing + circleDiameter;
    const contentHeight = offset + (rows - 1) * circleSpacing + circleDiameter;
    const svgWidth = 3 * contentWidth;
    const svgHeight = 3 * contentHeight;
  
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", svgWidth);
    svg.setAttribute("height", svgHeight);
    svg.setAttribute("id", "pipette-svg");
  
    const scaleX = svgWidth / contentWidth;
    const scaleY = svgHeight / contentHeight;
  
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        circle.setAttribute("cx", scaleX * (offset + j * circleSpacing));
        circle.setAttribute("cy", scaleY * (offset + i * circleSpacing));
        circle.setAttribute("r", scaleX * (circleDiameter / 2));
        circle.setAttribute("stroke", "black");
        circle.setAttribute("stroke-width", "2");
        circle.setAttribute("fill", "none");
        svg.appendChild(circle);
      }
    }
  
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", 0);
    rect.setAttribute("y", 0);
    rect.setAttribute("width", svgWidth);
    rect.setAttribute("height", svgHeight);
    rect.setAttribute("rx", 20);
    rect.setAttribute("ry", 20);
    rect.setAttribute("stroke", "blue");
    rect.setAttribute("stroke-width", "2");
    rect.setAttribute("fill", "none");
    svg.appendChild(rect);
  

    const pipetteText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      pipetteText.setAttribute("x", svgWidth / 2);
      pipetteText.setAttribute("y", 10); // Position at the top
      pipetteText.setAttribute("text-anchor", "middle");
      pipetteText.setAttribute("font-size", "12");
      pipetteText.textContent = "Pipette:" + channels + "ch";
      svg.appendChild(pipetteText);
    
      return svg;
    
  }
  
  function generateSVG() {
    const xOffset = parseFloat(document.getElementById("x-offset").value);
    const yOffset = parseFloat(document.getElementById("y-offset").value);
    const xSpacing = parseFloat(document.getElementById("x-spacing").value);
    const ySpacing = parseFloat(document.getElementById("y-spacing").value);
    const diameter = parseFloat(document.getElementById("diameter").value);
    const rows = parseInt(document.getElementById("rows").value);
    const cols = parseInt(document.getElementById("cols").value);
    const channels = parseInt(document.getElementById("channels").value);
  
    const plateSVG = generatePlateSVG(
      xOffset,
      yOffset,
      xSpacing,
      ySpacing,
      diameter,
      rows,
      cols
    );
    const pipetteSVG = generatePipetteSVG(channels);

    const svgContainer = document.getElementById("svg-container");
    svgContainer.innerHTML = ""; // Clear the previous plate SVG
    svgContainer.appendChild(plateSVG);
  
    // Remove previous pipette instance if it exists
    const previousPipette = document.getElementById("pipette-svg");
    if (previousPipette) {
      previousPipette.remove();
    }
  
    if (pipetteSVG) {
        pipetteSVG.style.position = "absolute";
        pipetteSVG.style.pointerEvents = "none";
        svgContainer.appendChild(pipetteSVG);
    
        // Get the first circle's position in the pipette
        const firstCircle = pipetteSVG.querySelector("circle");
        const firstCircleCX = parseFloat(firstCircle.getAttribute("cx"));
        const firstCircleCY = parseFloat(firstCircle.getAttribute("cy"));
    
        svgContainer.addEventListener("mousemove", (event) => {
          const containerRect = svgContainer.getBoundingClientRect();
          
          // Calculate mouse position relative to the container
          const mouseX = event.clientX - containerRect.left;
          const mouseY = event.clientY - containerRect.top;
          
          // Position pipette so the first circle aligns with the mouse
          pipetteSVG.style.left = (mouseX) + "px";
          pipetteSVG.style.top = (mouseY) + "px";
    
          highlightWells(plateSVG, pipetteSVG, channels);
        });
    
        // Reset highlight when mouse leaves the container
        svgContainer.addEventListener("mouseleave", () => {
          const wells = plateSVG.querySelectorAll(".well");
          wells.forEach((w) => {
            w.setAttribute("stroke", "black");
            w.setAttribute("fill", "none");
          });
        });
      }
    }
  
    function highlightWells(plateSVG, pipetteSVG, channels) {
        const pipetteCircles = pipetteSVG.querySelectorAll("circle");
        const plateWells = plateSVG.querySelectorAll(".well");
      
        // Reset all well and pipette circle colors
        plateWells.forEach((well) => {
          well.setAttribute("stroke", "black");
          well.setAttribute("fill", "none");
        });
        pipetteCircles.forEach((circle) => {
          circle.setAttribute("fill", "none");
        });
      
        pipetteCircles.forEach((circle) => {
          const cx = parseFloat(circle.getAttribute("cx")) + pipetteSVG.getBoundingClientRect().left - plateSVG.getBoundingClientRect().left;
          const cy = parseFloat(circle.getAttribute("cy")) + pipetteSVG.getBoundingClientRect().top - plateSVG.getBoundingClientRect().top;
          const r = parseFloat(circle.getAttribute("r"));
      
          let isConcentric = false; // Flag to track if the circle is concentric with any well
      
          plateWells.forEach((well) => {
            const wellX = parseFloat(well.getAttribute("data-x"));
            const wellY = parseFloat(well.getAttribute("data-y"));
            const wellR = parseFloat(well.getAttribute("r"));
      
            const distance = Math.sqrt((cx - wellX) ** 2 + (cy - wellY) ** 2);
            if (distance < r + wellR + 2) {
              well.setAttribute("fill", "red");
              isConcentric = true; // Mark the circle as concentric
            }
          });
      
          // Highlight the pipette circle only if it's concentric with a well
          if (isConcentric) {
            circle.setAttribute("fill", "#632bfc");
          }
        });
      }
  
  
  const generateButton = document.getElementById("generate");
  generateButton.addEventListener("click", generateSVG);