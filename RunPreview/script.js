// // // function fetchAndDisplayJSON() {
// // //     const url = document.getElementById("urlInput").value;
// // //     const outputDiv = document.getElementById("output");
  
// // //     fetch(url, {
// // //       headers: {
// // //         'opentrons-version': '*'
// // //       }
// // //     })
// // //       .then(response => {
// // //         if (!response.ok) {
// // //           throw new Error(`HTTP error! Status: ${response.status}`);
// // //         }
// // //         return response.json();
// // //       })
// // //       .then(data => {
// // //         outputDiv.textContent = JSON.stringify(data, null, 2);
// // //       })
// // //       .catch(error => {
// // //         outputDiv.textContent = "Error fetching or parsing JSON: " + error.message;
// // //       });
// // //   }
  
// //   function fetchAndDisplayJSON() {
// //     const url = document.getElementById("urlInput").value;
// //     const outputDiv = document.getElementById("output");
  
// //     fetch(url, {
// //       headers: {
// //         'opentrons-version': '*'
// //       }
// //     })
// //       .then(response => {
// //         if (!response.ok) {
// //           throw new Error(`HTTP error! Status: ${response.status}`);
// //         }
// //         return response.json();
// //       })
// //       .then(data => {
// //         // --- JSON Parsing Logic ---
  
// //         const commands = data.commands || [];  // Get commands array, handle if it doesn't exist
// //         const parsedCommands = [];
  
// //         for (let i = 0; i < commands.length; i++) {
// //           const command = commands[i];
// //           const commandType = command.commandType || "Unknown"; // Handle missing commandType
  
// //           const commandText = `${i + 1} ${commandType}`;
// //           parsedCommands.push(commandText);
// //         }
  
// //         // --- Display Results ---
  
// //         if (parsedCommands.length > 0) {
// //           outputDiv.textContent = parsedCommands.join('\n'); // Display as a list
// //         } else {
// //           outputDiv.textContent = "No commands found in the JSON data.";
// //         }
  
// //       })
// //       .catch(error => {
// //         outputDiv.textContent = "Error fetching or parsing JSON: " + error.message;
// //       });
// //   }
// //   function downloadParsedCommands() {
// //     const outputDiv = document.getElementById("output");
// //     const text = outputDiv.textContent;
// //     const blob = new Blob([text], { type: "text/plain" });
// //     const a = document.createElement("a");
// //     a.href = URL.createObjectURL(blob);
// //     a.download = "parsed_commands.txt";
// //     a.click();
// //   }

// // // Get references to the elements
// // const urlInput = document.getElementById("urlInput");
// // const outputDiv = document.getElementById("output");
// // const downloadButton = document.getElementById("downloadButton"); // Get the button here

// // function fetchAndDisplayJSON() {
// //   const url = urlInput.value;

// //   fetch(url, {
// //     headers: {
// //       'opentrons-version': '*'
// //     }
// //   })
// //     .then(response => {
// //       if (!response.ok) {
// //         throw new Error(`HTTP error! Status: ${response.status}`);
// //       }
// //       return response.json();
// //     })
// //     .then(data => {
// //       const commands = data.commands || []; 
// //       const parsedCommands = [];

// //       for (let i = 0; i < commands.length; i++) {
// //         const command = commands[i];
// //         const commandType = command.commandType || "Unknown";

// //         const commandText = `${i + 1} ${commandType}`;
// //         parsedCommands.push(commandText);
// //       }

// //       if (parsedCommands.length > 0) {
// //         outputDiv.textContent = parsedCommands.join('\n');
// //         downloadButton.style.display = "block"; // Show the button after parsing
// //       } else {
// //         outputDiv.textContent = "No commands found in the JSON data.";
// //         downloadButton.style.display = "none"; // Keep button hidden if no commands
// //       }
// //     })
// //     .catch(error => {
// //       outputDiv.textContent = "Error fetching or parsing JSON: " + error.message;
// //       downloadButton.style.display = "none"; // Keep button hidden on error
// //     });
// // }

// // function downloadParsedCommands() {
// //   const text = outputDiv.textContent;
// //   const blob = new Blob([text], { type: "text/plain" });
// //   const a = document.createElement("a");
// //   a.href = URL.createObjectURL(blob);
// //   a.download = "parsed_commands.txt";
// //   a.click();
// // }
// // function fetchAndDisplayJSON() {
// //     const urlInput = document.getElementById("urlInput");
// //     const outputDiv = document.getElementById("output");
// //     const downloadButton = document.getElementById("downloadButton");
  
// //     fetch(urlInput.value, {
// //       headers: {
// //         'opentrons-version': '*'
// //       }
// //     })
// //       .then(response => {
// //         if (!response.ok) {
// //           throw new Error(`HTTP error! Status: ${response.status}`);
// //         }
// //         return response.json();
// //       })
// //       .then(data => {
// //         const commands = data.commands || []; 
// //         const parsedCommands = [];
  
// //         // Add header to output
// //         parsedCommands.push("Step\tCommands");
  
// //         for (let i = 0; i < commands.length; i++) {
// //           const command = commands[i];
// //           const commandType = command.commandType || "Unknown";
// //           const commandText = `${i + 1}\t${commandType}`;
// //           parsedCommands.push(commandText);
// //         }
  
// //         if (parsedCommands.length > 0) {
// //           outputDiv.textContent = parsedCommands.join('\n'); 
// //           downloadButton.style.display = "block"; 
// //         } else {
// //           outputDiv.textContent = "No commands found in the JSON data.";
// //           downloadButton.style.display = "none"; 
// //         }
// //       })
// //       .catch(error => {
// //         outputDiv.textContent = "Error fetching or parsing JSON: " + error.message;
// //         downloadButton.style.display = "none"; 
// //       });
// //   }

// // Get references to the elements
// // const urlInput = document.getElementById("urlInput");
// // const outputDiv = document.getElementById("output");
// // const downloadButton = document.getElementById("downloadButton"); // Get the button here

// // function fetchAndDisplayJSON() {
// //   const url = urlInput.value;

// //   fetch(url, {
// //     headers: {
// //       'opentrons-version': '*'
// //     }
// //   })
// //     .then(response => {
// //       if (!response.ok) {
// //         throw new Error(`HTTP error! Status: ${response.status}`);
// //       }
// //       return response.json();
// //     })
// //     .then(data => {
// //       const commands = data.commands || []; 
// //       let tipCount = 0;
// //       const parsedCommands = commands.map((command, index) => {
// //         if (command.commandType === 'pickUpTip') {
// //             tipCount++;
// //         }
// //         return `${index + 1}\t${command.commandType || 'Unknown'}`;
// //     });
      
// //     // Display total tips used
// //     parsedCommands.push(`\nTotal tips used: ${tipCount}`);

// //       if (parsedCommands.length > 0) {
// //         outputDiv.textContent = parsedCommands.join('\n'); 
// //         downloadButton.style.display = "block"; 
// //       } else {
// //         outputDiv.textContent = "No commands found in the JSON data.";
// //         downloadButton.style.display = "none"; 
// //       }
// //     })
// //     .catch(error => {
// //       outputDiv.textContent = "Error fetching or parsing JSON: " + error.message;
// //       downloadButton.style.display = "none"; 
// //     });
// // }

// // function downloadParsedCommands() {
// //   const text = outputDiv.textContent;
// //   const blob = new Blob([text], { type: "text/plain" });
// //   const a = document.createElement("a");
// //   a.href = URL.createObjectURL(blob);
// //   a.download = "parsed_commands.txt";
// //   a.click();
// // }

// // function fetchAndDisplayJSON() {
// //     const urlInput = document.getElementById("urlInput");
// //     const outputDiv = document.getElementById("output");
// //     const downloadButton = document.getElementById("downloadButton");
  
// //     fetch(urlInput.value, {
// //       headers: {
// //         'opentrons-version': '*'
// //       }
// //     })
// //       .then(response => {
// //         if (!response.ok) {
// //           throw new Error(`HTTP error! Status: ${response.status}`);
// //         }
// //         return response.json();
// //       })
// //       .then(data => {
// //         const commands = data.commands || [];
// //         const parsedCommands = [];
// //         const pipetteIds = [];
// //         const pipettes = []; // Initialize with default pipettes
// //         const tipsUsed = [];
// //         let totalTipsUsed = 0; 
  
// //         // Track pipette IDs from loadPipette commands
// //         for (const command of commands) {
// //           if (command.commandType === 'loadPipette') {
// //             const pipetteName = command.params.pipetteName;
// //             const pipetteNumber = parseInt(pipetteName.split('_')[1][0]); // Extract pipette number
// //             pipettes.push(pipetteNumber);
// //             pipetteIds.push(command.result.pipetteId);
// //           }
// //         }
  
// //         // Generate parsed commands and track tip usage
// //         parsedCommands.push("Step\tCommands");
// //         for (let i = 0; i < commands.length; i++) {
// //           const command = commands[i];
// //           if (command.commandType === 'pickUpTip') {
// //             const pipetteIdIndex = command.params.pipetteId;
// //             if(pipetteIdIndex in pipetteIds){
// //               const pipetteIndex = pipetteIds.indexOf(pipetteIdIndex); // Get index to match with pipettes array
// //               const pipetteNum = pipettes[pipetteIndex];
// //               tipsUsed.push(pipetteNum);
// //             }          
// //           }
// //           parsedCommands.push(`${i + 1}\t${command.commandType}`);
// //         }
        
// //         // Calculate and display total tips used
// //         totalTipsUsed = tipsUsed.reduce((sum, val) => sum + val, 0);
// //         parsedCommands.push(`\nTotal tips used: ${totalTipsUsed}`);
  
// //         if (parsedCommands.length > 0) {
// //           outputDiv.textContent = parsedCommands.join('\n');
// //           downloadButton.style.display = "block";
// //         } else {
// //           outputDiv.textContent = "No commands found in the JSON data.";
// //           downloadButton.style.display = "none";
// //         }
// //       })
// //       .catch(error => {
// //         outputDiv.textContent = "Error fetching or parsing JSON: " + error.message;
// //         downloadButton.style.display = "none";
// //       });
// //   }
  
// //   function downloadParsedCommands() {
// //     // ... (download function remains the same) ...
// //   }
  
// // Get references to the elements
// // const urlInput = document.getElementById("urlInput");
// // const outputDiv = document.getElementById("output");
// // const downloadButton = document.getElementById("downloadButton");

// // function fetchAndDisplayJSON() {
// //     const url = urlInput.value;

// //     fetch(url, {
// //         headers: { 'opentrons-version': '*' }
// //     })
// //     .then(response => {
// //         if (!response.ok) {
// //             throw new Error(`HTTP error! Status: ${response.status}`);
// //         }
// //         return response.json();
// //     })
// //     .then(data => {
// //         const commands = data.commands || [];
// //         const parsedCommands = [];
// //         const pipetteIds = [];
// //         const pipettes = [];
// //         const tipsUsed = [];

// //         // Track pipette IDs and channel types
// //         for (const command of commands) {
// //             if (command.commandType === 'loadPipette') {
// //                 const pipetteName = command.params.pipetteName;
// //                 const channelType = pipetteName.split('_')[1][0]; // 's' or 'm'
// //                 pipettes.push(channelType === 'm' ? 8 : 1); // 8 for multi, 1 for single
// //                 pipetteIds.push(command.result.pipetteId);
// //             }
// //         }

// //         // Generate parsed commands and track tip usage
// //         parsedCommands.push("Step\tCommands");
// //         for (let i = 0; i < commands.length; i++) {
// //             const command = commands[i];
// //             if (command.commandType === 'pickUpTip') {
// //               const pipetteIdIndex = command.params.pipetteId;
// //               if (pipetteIdIndex in pipetteIds){
// //                 const pipetteIndex = pipetteIds.indexOf(pipetteIdIndex);
// //                 const channel = pipettes[pipetteIndex];
// //                 tipsUsed.push(channel);
// //                 parsedCommands.push(`\n--------- ${channel}-channel pipette used ------`);
// //               }
// //             }
// //             parsedCommands.push(`${i + 1}\t${command.commandType}`);
// //         }

// //         // Calculate and display total tips used
// //         const totalTipsUsed = tipsUsed.reduce((sum, val) => sum + val, 0);
// //         parsedCommands.push(`\nTotal tips used: ${totalTipsUsed}`);

// //         if (parsedCommands.length > 0) {
// //             outputDiv.textContent = parsedCommands.join('\n');
// //             downloadButton.style.display = "block";
// //         } else {
// //             outputDiv.textContent = "No commands found in the JSON data.";
// //             downloadButton.style.display = "none";
// //         }
// //     })
// //     .catch(error => {
// //         outputDiv.textContent = "Error fetching or parsing JSON: " + error.message;
// //         downloadButton.style.display = "none";
// //     });
// // }


// // Get references to the elements
// const urlInput = document.getElementById("urlInput");
// const outputDiv = document.getElementById("output");
// const downloadButton = document.getElementById("downloadButton");
// const scrollToTopButton = document.getElementById("scrollToTopButton");


// async function handleFileUpload() {
//   const fileInput = document.getElementById("fileInput");
//   const file = fileInput.files[0];

//   if (!file) {
//     outputDiv.textContent = "Please select an analysis.json file.";
//     return;
//   }

//   try {
//     const text = await file.text();
//     const data = JSON.parse(text);



// // function fetchAndDisplayJSON() {
// //   const url = urlInput.value;

// //   fetch(url, {
// //     headers: {
// //       'opentrons-version': '*'
// //     }
// //   })
// //     .then(response => {
// //       if (!response.ok) {
// //         throw new Error(`HTTP error! Status: ${response.status}`);
// //       }
// //       return response.json();
// //     })
//     .then(data => {
//       const commands = data.commands || [];
//       const parsedCommands = [];
//       const pipetteIds = [];
//       const pipettes = [];

//       // Track pipette IDs and channel types
//       for (const command of commands) {
//         if (command.commandType === 'loadPipette') {
//           const pipetteName = command.params.pipetteName;
//           const channelType = pipetteName.split('_')[1][0]; // 's' or 'm'
//           pipettes.push(channelType === 'm' ? 8 : 1); // 8 for multi, 1 for single
//           pipetteIds.push(command.result.pipetteId);
//         }
//       }

//       // Generate parsed commands and track tip usage
//       parsedCommands.push("Step\tCommands");
//       let totalTipsUsed = 0;
//       for (let i = 0; i < commands.length; i++) {
//         const command = commands[i];
//         if (command.commandType === 'pickUpTip') {
//           // Find index of pipetteId in pipetteIds
//           const pipetteIndex = pipetteIds.indexOf(command.params.pipetteId);

//           // Check if the pipette was found and get the corresponding channel
//           if (pipetteIndex !== -1) {
//             const channel = pipettes[pipetteIndex];
//             totalTipsUsed += channel;
//             parsedCommands.push(`\n--------- ${channel}-channel pipette used ------`);
//           }
//         }
//         parsedCommands.push(`${i + 1}\t${command.commandType}`);
//       }

//       // Display total tips used
//       parsedCommands.push(`\nTotal tips used: ${totalTipsUsed}`);

//       if (parsedCommands.length > 0) {
//         outputDiv.textContent = parsedCommands.join('\n');
//         downloadButton.style.display = "block";
        
//         // Check if output is long enough to show the scroll button
//         if (outputDiv.scrollHeight > outputDiv.clientHeight) {
//             scrollToTopButton.style.display = "block";
//         }
//       } else {
//         outputDiv.textContent = "No commands found in the JSON data.";
//         downloadButton.style.display = "none";
//       }
//     })
//       } catch (error) {
//     outputDiv.textContent = "Error reading or parsing the file: " + error.message;
//   }
// }
//     // .catch(error => {
//     //   outputDiv.textContent = "Error fetching or parsing JSON: " + error.message;
//     //   downloadButton.style.display = "none";
//     // });
// // }

// Get references to the elements
const outputDiv = document.getElementById("output");
const downloadButton = document.getElementById("downloadButton");
const scrollToTopButton = document.getElementById("scrollToTopButton");

async function handleFileUpload() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) {
    outputDiv.textContent = "Please select an analysis.json file.";
    return;
  }

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    const commands = data.commands || [];
    const parsedCommands = [];
    const pipetteIds = [];
    const pipettes = [];

    // Track pipette IDs and channel types
    for (const command of commands) {
      if (command.commandType === 'loadPipette') {
        const pipetteName = command.params.pipetteName;
        const channelType = pipetteName.split('_')[1][0]; // 's' or 'm'
        pipettes.push(channelType === 'm' ? 8 : 1); // 8 for multi, 1 for single
        pipetteIds.push(command.result.pipetteId);
      }
    }

    // Generate parsed commands and track tip usage
    parsedCommands.push("Step\tCommands");
    let totalTipsUsed = 0;
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.commandType === 'pickUpTip') {
        // Find index of pipetteId in pipetteIds
        const pipetteIndex = pipetteIds.indexOf(command.params.pipetteId);
        if (pipetteIndex !== -1) {
          const channel = pipettes[pipetteIndex];
          totalTipsUsed += channel;
          parsedCommands.push(`\n--------- ${channel}-channel pipette used ------`);
        }
      }
      parsedCommands.push(`${i + 1}\t${command.commandType}`);
    }
    parsedCommands.push(`\nTotal tips used: ${totalTipsUsed}`);

    outputDiv.textContent = parsedCommands.join('\n');
    downloadButton.style.display = "block";

    if (outputDiv.scrollHeight > outputDiv.clientHeight) {
      scrollToTopButton.style.display = "block";
    }

  } catch (error) {
    outputDiv.textContent = "Error reading or parsing the file: " + error.message;
    downloadButton.style.display = "none";
  }
}

function downloadParsedCommands() {
  const text = outputDiv.textContent;
  const blob = new Blob([text], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "parsed_commands.txt";
  a.click();
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
