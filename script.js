const canvas = document.getElementById('field');
        const ctx = canvas.getContext('2d');
    
        const widthInput = document.getElementById('width');
        const heightInput = document.getElementById('height');
        const depthInput = document.getElementById('depth');
        const unitSelect = document.getElementById('unit');
        const redCircleXInput = document.getElementById('redCircleX');
        const redCircleYInput = document.getElementById('redCircleY');
        const redCircleZInput = document.getElementById('redCircleZ');
        const redCircleDiameterInput = document.getElementById('redCircleDiameter');
        const angleInput = document.getElementById('angleInput');
        const distanceInput = document.getElementById('distanceInput');
        const polarZInput = document.getElementById('polarZInput');
        const directionInput = document.getElementById('directionInput');
        const addCircleButton = document.getElementById('addCircle');
        const removeCircleButton = document.getElementById('removeCircle');
        const coordinatesList = document.getElementById('coordinatesList');
        const arrowUpButton = document.getElementById('arrowUp');
        const arrowDownButton = document.getElementById('arrowDown');
        const arrowLeftButton = document.getElementById('arrowLeft');
        const arrowRightButton = document.getElementById('arrowRight');
        const zoomSlider = document.getElementById('zoomSlider');
    
        const toolSelect = document.getElementById('toolSelect');
    
        const coordinatesInputs = document.getElementById('coordinatesInputs');
        const polarInputs = document.getElementById('polarInputs');
        const inputModeRadios = document.querySelectorAll('input[name="inputMode"]');
    
        const metalDropdown = document.getElementById('metalDropdown');
        const alloyDropdown = document.getElementById('alloyDropdown');
    
        let squareScale = 1;
        const scaleFactor = 1.3;
        let offsetX = 0;
        let offsetY = 0;
        let isDragging = false;
        let dragStartX, dragStartY;
        let rotationX = 0;
        let rotationY = 0;
    
        const units = {
            inch: 1,
            feet: 12,
            cm: 0.393701,
            mm: 0.0393701
        };
    
        let currentUnit = "inch"; // Initial unit
    
        let redCircles = [];
        let displayOrder = [];
    
        const centerX = () => canvas.width / 2 + offsetX;
        const centerY = () => canvas.height / 2 + offsetY;
    
        function drawCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
    
            const isDarkMode = document.body.classList.contains('dark-mode');
    
            if (isDarkMode) {
                ctx.fillStyle = '#333333';
            } else {
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, '#e0e0e0');
                gradient.addColorStop(1, '#f8f8f8');
                ctx.fillStyle = gradient;
            }
    
            ctx.fillRect(0, 0, canvas.width, canvas.height);
    
            ctx.save();
            ctx.translate(centerX(), centerY());
            ctx.scale(1, 1);
            ctx.translate(-centerX(), -centerY());
    
            ctx.beginPath();
            ctx.moveTo(-canvas.width * 2, centerY());
            ctx.lineTo(3 * canvas.width, centerY());
            ctx.moveTo(centerX(), -canvas.height * 2);
            ctx.lineTo(centerX(), 3 * canvas.height);
            ctx.moveTo(centerX() - canvas.width / 2, centerY() + canvas.height / 2);
            ctx.lineTo(centerX() + canvas.width / 2, centerY() - canvas.height / 2);
            ctx.strokeStyle = isDarkMode ? '#ffffff' : '#333';
            ctx.lineWidth = 2;
            ctx.stroke();
    
            const markLength = 10;
            const unit = units[unitSelect.value];
            const spacing = unit;
    
            const squareWidth = convertValue(parseFloat(widthInput.value), unitSelect.value, currentUnit);
            const squareHeight = convertValue(parseFloat(heightInput.value), unitSelect.value, currentUnit);
            const squareDepth = convertValue(parseFloat(depthInput.value), unitSelect.value, currentUnit);
    
            const numXMarks = Math.ceil(squareWidth / spacing);
            const numYMarks = Math.ceil(squareHeight / spacing);
    
            ctx.strokeStyle = isDarkMode ? '#888' : '#666';
            ctx.lineWidth = 1;
            for (let i = 1; i <= numXMarks; i++) {
                let x = centerX() + i * spacing;
                ctx.moveTo(x, centerY() - markLength / 2);
                ctx.lineTo(x, centerY() + markLength / 2);
    
                x = centerX() - i * spacing;
                ctx.moveTo(x, centerY() - markLength / 2);
                ctx.lineTo(x, centerY() + markLength / 2);
            }
    
            for (let i = 1; i <= numYMarks; i++) {
                let y = centerY() + i * spacing;
                ctx.moveTo(centerX() - markLength / 2, y);
                ctx.lineTo(centerX() + markLength / 2, y);
    
                y = centerY() - i * spacing;
                ctx.moveTo(centerX() - markLength / 2, y);
                ctx.lineTo(centerX() + markLength / 2, y);
            }
    
            ctx.stroke();
    
            ctx.font = '16px Arial';
            ctx.fillStyle = isDarkMode ? '#ffffff' : '#333';
            ctx.fillText('X', canvas.width - 20, centerY() - 10);
            ctx.fillText('Y', centerX() + 10, 20);
            ctx.fillText('Z', canvas.width - 20, 20);
    
            draw3DCube(centerX(), centerY(), squareWidth, squareHeight, squareDepth, squareScale);
    
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            redCircles.forEach((circle) => {
                ctx.fillStyle = 'red';
                ctx.beginPath();
                const rotatedCircle = rotate([circle.x, circle.y, circle.z], rotationX, rotationY);
                const projected = project(rotatedCircle[0], rotatedCircle[1], rotatedCircle[2], squareScale, circle.diameter);
                ctx.arc(centerX() + projected.x, centerY() - projected.y, projected.size / 2, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.shadowBlur = 0;
    
            ctx.fillStyle = isDarkMode ? '#ffffff' : '#333';
            ctx.fillText('++', centerX() + 10, centerY() - 10);
            ctx.fillText('-+', centerX() - 20, centerY() - 10);
            ctx.fillText('+-', centerX() + 10, centerY() + 20);
            ctx.fillText('--', centerX() - 20, centerY() + 20);
    
            ctx.restore();
        }
    
        function draw3DCube(x, y, width, height, depth, scale) {
            const vertices = [
                [-width / 2, -height / 2, -depth / 2],
                [width / 2, -height / 2, -depth / 2],
                [width / 2, height / 2, -depth / 2],
                [-width / 2, height / 2, -depth / 2],
                [-width / 2, -height / 2, depth / 2],
                [width / 2, -height / 2, depth / 2],
                [width / 2, height / 2, depth / 2],
                [-width / 2, height / 2, depth / 2]
            ];
    
            const faces = [
                [0, 1, 2, 3],
                [4, 5, 6, 7],
                [0, 1, 5, 4],
                [2, 3, 7, 6],
                [0, 3, 7, 4],
                [1, 2, 6, 5]
            ];
    
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(scale, scale);
            ctx.rotate(rotationX);
            ctx.rotate(rotationY);
            ctx.strokeStyle = 'blue';
            ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
    
            vertices.forEach(vertex => {
                const rotatedVertex = rotate(vertex, rotationX, rotationY);
                vertex[0] = rotatedVertex[0];
                vertex[1] = rotatedVertex[1];
                vertex[2] = rotatedVertex[2];
            });
    
            faces.forEach(face => {
                ctx.beginPath();
                ctx.moveTo(vertices[face[0]][0], vertices[face[0]][1]);
                for (let i = 1; i < face.length; i++) {
                    ctx.lineTo(vertices[face[i]][0], vertices[face[i]][1]);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            });
    
            ctx.restore();
        }
    
        function rotate(vertex, rotationX, rotationY) {
            let [x, y, z] = vertex;
    
            let cosX = Math.cos(rotationX);
            let sinX = Math.sin(rotationX);
            let y1 = y * cosX - z * sinX;
            let z1 = y * sinX + z * cosX;
    
            let cosY = Math.cos(rotationY);
            let sinY = Math.sin(rotationY);
            let x1 = x * cosY + z1 * sinY;
            let z2 = -x * sinY + z1 * cosY;
    
            return [x1, y1, z2];
        }
    
        function project(x, y, z, scale, diameter) {
            const zScale = scale / (1 + z / 200);
            return {
                x: x * zScale,
                y: y * zScale,
                size: diameter * zScale
            };
        }
    
        function addRedCircle() {
            const x = parseFloat(redCircleXInput.value);
            const y = parseFloat(redCircleYInput.value);
            const z = parseFloat(redCircleZInput.value);
            const diameter = parseFloat(redCircleDiameterInput.value);
            const distance = parseFloat(distanceInput.value);
            const angle = parseFloat(angleInput.value) * (Math.PI / 180);
            const direction = directionInput.value;
            const polarZ = parseFloat(polarZInput.value);
            const selectedTool = toolSelect.value; // Get the selected tool
    
            if (isNaN(diameter)) {
                alert("Please enter valid numerical values for the diameter.");
                return;
            }
    
            const selectedMode = document.querySelector('input[name="inputMode"]:checked').value;
            if (selectedMode === 'coordinates') {
                if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
                    redCircles.push({ x, y, z, diameter, tool: selectedTool, method: 'coordinate' });
                } else {
                    alert("Please enter valid numerical values for coordinates.");
                    return;
                }
            } else if (selectedMode === 'polar') {
                if (!isNaN(distance) && !isNaN(angle) && !isNaN(polarZ)) {
                    const finalAngle = direction === 'cw' ? -angle : angle;
                    const circleX = distance * Math.cos(finalAngle);
                    const circleY = distance * Math.sin(finalAngle);
                    redCircles.push({ x: circleX, y: circleY, z: polarZ, diameter, tool: selectedTool, distance, angle: finalAngle, method: 'angle' });
                } else {
                    alert("Please enter valid numerical values for angle, distance, and Z coordinate.");
                    return;
                }
            }
    
            displayOrder.push(displayOrder.length);
            updateCoordinatesList();
            drawCanvas();
        }
    
        function removeRedCircle() {
            redCircles.pop();
            displayOrder.pop();
            updateCoordinatesList();
            drawCanvas();
        }
    
        function deleteRedCircle(index) {
            redCircles.splice(index, 1);
            displayOrder.splice(index, 1);
            updateCoordinatesList();
            drawCanvas();
        }
    
        function editRedCircle(index) {
            const circle = redCircles[index];
            let x, y, z, diameter, distance, angle, direction;
    
            if (circle.method === 'angle') {
                distance = parseFloat(prompt("Enter new Distance from Center:", circle.distance));
                angle = parseFloat(prompt("Enter new Angle (Degrees):", Math.abs(circle.angle * (180 / Math.PI)))); // Convert to degrees
                direction = prompt("Enter new Direction (cw/cc):", circle.angle < 0 ? 'cw' : 'cc');
                z = parseFloat(prompt("Enter new Z coordinate:", circle.z));
                diameter = parseFloat(prompt("Enter new Diameter:", circle.diameter));
    
                if (!isNaN(distance) && !isNaN(angle) && !isNaN(z) && !isNaN(diameter)) {
                    const finalAngle = direction === 'cw' ? -angle * (Math.PI / 180) : angle * (Math.PI / 180); // Convert to radians
                    x = distance * Math.cos(finalAngle); // Convert to radians
                    y = distance * Math.sin(finalAngle); // Convert to radians
                    redCircles[index] = { x, y, z, diameter, tool: circle.tool, distance, angle: finalAngle, method: 'angle' }; // Store angle in radians
                }
            } else {
                x = parseFloat(prompt("Enter new X coordinate:", circle.x));
                y = parseFloat(prompt("Enter new Y coordinate:", circle.y));
                z = parseFloat(prompt("Enter new Z coordinate:", circle.z));
                diameter = parseFloat(prompt("Enter new Diameter:", circle.diameter));
    
                if (!isNaN(x) && !isNaN(y) && !isNaN(z) && !isNaN(diameter)) {
                    redCircles[index] = { x, y, z, diameter, tool: circle.tool, method: 'coordinate' };
                }
            }
    
            updateCoordinatesList();
            drawCanvas();
        }
    
        function mirrorRedCircle(index) {
            const circle = redCircles[index];
            const mirroredCircles = [
                { ...circle, x: -circle.x, y: circle.y }, // Mirror across Y-axis
                { ...circle, x: circle.x, y: -circle.y }, // Mirror across X-axis
                { ...circle, x: -circle.x, y: -circle.y } // Mirror across both axes
            ];
    
            mirroredCircles.forEach((mirroredCircle) => {
                redCircles.push(mirroredCircle);
                displayOrder.push(displayOrder.length);
            });
    
            updateCoordinatesList();
            drawCanvas();
        }
    
        function parallelRedCircle(index) {
            const circle = redCircles[index];
            let parallelCircle;
            if (circle.x >= 0 && circle.y >= 0) {
                parallelCircle = { ...circle, x: -circle.x, y: circle.y }; // 1st quadrant to 2nd quadrant
            } else if (circle.x < 0 && circle.y >= 0) {
                parallelCircle = { ...circle, x: -circle.x, y: circle.y }; // 2nd quadrant to 1st quadrant
            } else if (circle.x < 0 && circle.y < 0) {
                parallelCircle = { ...circle, x: -circle.x, y: circle.y }; // 3rd quadrant to 4th quadrant
            } else {
                parallelCircle = { ...circle, x: -circle.x, y: circle.y }; // 4th quadrant to 3rd quadrant
            }
    
            redCircles.push(parallelCircle);
            displayOrder.push(displayOrder.length);
            updateCoordinatesList();
            drawCanvas();
        }
    
        function formatCoordinate(value) {
            return value % 1 === 0 ? value.toFixed(0) : value.toFixed(4);
        }
    
        function convertValue(value, fromUnit, toUnit) {
            if (fromUnit === toUnit) return value;
            const fromFactor = units[fromUnit];
            const toFactor = units[toUnit];
            return (value * fromFactor) / toFactor;
        }
    
        function updateCoordinatesList() {
            coordinatesList.innerHTML = '';
            displayOrder.forEach((orderIndex) => {
                const circle = redCircles[orderIndex];
                const li = document.createElement('li');
                li.classList.add('coordinate-item');
    
                let feedRate = '';
                let speed = '';
    
                const diameter = convertValue(parseFloat(circle.diameter), currentUnit, unitSelect.value);
                const tool = circle.tool;
                const material = metalDropdown.value;
                const alloy = alloyDropdown.value;
    
                if (!isNaN(diameter) && tool && material && alloy) {
                    // Calculation logic for feed and speed based on tool, diameter, material, and alloy
                    feedRate = calculateFeedRate(tool, diameter, material, alloy);
                    speed = calculateSpeed(tool, diameter, material, alloy);
                }
    
                if (circle.method === 'angle') {
                    const direction = circle.angle < 0 ? 'cw' : 'cc';
                    li.textContent = `Circle ${orderIndex + 1}: Distance = ${circle.distance.toFixed(1)}, Angle = ${Math.abs(circle.angle * (180 / Math.PI)).toFixed(1)} (${direction}), Z = ${formatCoordinate(circle.z)}, Diameter = ${circle.diameter} ${unitSelect.value}, Tool = ${circle.tool}, Feed Rate = ${feedRate}, Speed = ${speed}`;
                } else {
                    li.textContent = `Circle ${orderIndex + 1}: X = ${formatCoordinate(circle.x)}, Y = ${formatCoordinate(circle.y)}, Z = ${formatCoordinate(circle.z)}, Diameter = ${circle.diameter} ${unitSelect.value}, Tool = ${circle.tool}, Feed Rate = ${feedRate}, Speed = ${speed}`;
                }
    
                li.draggable = true;
    
                const editButton = document.createElement('span');
                editButton.textContent = 'Edit';
                editButton.classList.add('action-button', 'edit-button');
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    editRedCircle(orderIndex);
                });
    
                const deleteButton = document.createElement('span');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('action-button', 'delete-button');
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteRedCircle(orderIndex);
                });
    
                const mirrorButton = document.createElement('span');
                mirrorButton.textContent = 'Mirror';
                mirrorButton.classList.add('action-button', 'mirror-button');
                mirrorButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    mirrorRedCircle(orderIndex);
                });
    
                const parallelButton = document.createElement('span');
                parallelButton.textContent = 'Parallel';
                parallelButton.classList.add('action-button', 'parallel-button');
                parallelButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    parallelRedCircle(orderIndex);
                });
    
                const buttonContainer = document.createElement('div');
                buttonContainer.classList.add('action-buttons');
                buttonContainer.appendChild(editButton);
                buttonContainer.appendChild(deleteButton);
                buttonContainer.appendChild(mirrorButton);
                buttonContainer.appendChild(parallelButton);
    
                li.appendChild(buttonContainer);
                coordinatesList.appendChild(li);
    
                // Apply dark mode classes if dark mode is active
                if (document.body.classList.contains('dark-mode')) {
                    li.classList.add('dark-mode');
                    editButton.classList.add('dark-mode');
                    deleteButton.classList.add('dark-mode');
                    mirrorButton.classList.add('dark-mode');
                    parallelButton.classList.add('dark-mode');
                }
            });
    
            addDragAndDropHandlers();
        }
    
        function addDragAndDropHandlers() {
            const listItems = document.querySelectorAll('.coordinate-item');
            listItems.forEach((item, index) => {
                item.addEventListener('dragstart', (e) => {
                    item.classList.add('dragging');
                    e.dataTransfer.setData('text/plain', index);
                });
    
                item.addEventListener('dragend', () => {
                    item.classList.remove('dragging');
                });
    
                item.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    const draggingItem = document.querySelector('.dragging');
                    const siblings = Array.from(listItems).filter(i => i !== draggingItem);
                    const nextSibling = siblings.find(sibling => {
                        return e.clientY <= sibling.getBoundingClientRect().top + sibling.getBoundingClientRect().height / 2;
                    });
                    coordinatesList.insertBefore(draggingItem, nextSibling);
                });
    
                item.addEventListener('drop', (e) => {
                    const oldIndex = e.dataTransfer.getData('text/plain');
                    const newIndex = Array.from(listItems).indexOf(item);
    
                    if (newIndex !== -1) {
                        const movedItem = displayOrder.splice(oldIndex, 1)[0];
                        displayOrder.splice(newIndex, 0, movedItem);
                        updateCoordinatesList();
                    }
                });
            });
        }
    
        function isPointInCircle(pointX, pointY, circle) {
            const projected = project(circle.x, circle.y, circle.z, squareScale, circle.diameter);
            const circleX = centerX() + projected.x;
            const circleY = centerY() - projected.y;
            const distance = Math.sqrt((pointX - circleX) ** 2 + (pointY - circleY) ** 2);
            return distance <= projected.size / 2;
        }
    
        function handleKeydown(event) {
            const rotationStep = 0.1;
            switch (event.key) {
                case 'ArrowUp':
                    rotationX -= rotationStep;
                    break;
                case 'ArrowDown':
                    rotationX += rotationStep;
                    break;
                case 'ArrowLeft':
                    rotationY -= rotationStep;
                    break;
                case 'ArrowRight':
                    rotationY += rotationStep;
                    break;
                default:
                    return;
            }
            drawCanvas();
        }
    
        function rotateUp() {
            rotationX -= 0.1;
            drawCanvas();
        }
    
        function rotateDown() {
            rotationX += 0.1;
            drawCanvas();
        }
    
        function rotateLeft() {
            rotationY -= 0.1;
            drawCanvas();
        }
    
        function rotateRight() {
            rotationY += 0.1;
            drawCanvas();
        }
    
        function zoom() {
            squareScale = parseFloat(zoomSlider.value);
            drawCanvas();
        }
    
        inputModeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value === 'coordinates') {
                    coordinatesInputs.style.display = 'block';
                    polarInputs.style.display = 'none';
                } else {
                    coordinatesInputs.style.display = 'none';
                    polarInputs.style.display = 'block';
                }
            });
        });
    
        drawCanvas();
    
        widthInput.addEventListener('input', drawCanvas);
        heightInput.addEventListener('input', drawCanvas);
        depthInput.addEventListener('input', drawCanvas);
        unitSelect.addEventListener('change', (e) => {
            const newUnit = e.target.value;
            widthInput.value = convertValue(parseFloat(widthInput.value), currentUnit, newUnit);
            heightInput.value = convertValue(parseFloat(heightInput.value), currentUnit, newUnit);
            depthInput.value = convertValue(parseFloat(depthInput.value), currentUnit, newUnit);
            redCircles = redCircles.map(circle => ({
                ...circle,
                x: convertValue(circle.x, currentUnit, newUnit),
                y: convertValue(circle.y, currentUnit, newUnit),
                z: convertValue(circle.z, currentUnit, newUnit),
                diameter: convertValue(circle.diameter, currentUnit, newUnit)
            }));
            currentUnit = newUnit;
            updateCoordinatesList();
            drawCanvas();
        });
        addCircleButton.addEventListener('click', addRedCircle);
        removeCircleButton.addEventListener('click', removeRedCircle);
        arrowUpButton.addEventListener('click', rotateUp);
        arrowDownButton.addEventListener('click', rotateDown);
        arrowLeftButton.addEventListener('click', rotateLeft);
        arrowRightButton.addEventListener('click', rotateRight);
        zoomSlider.addEventListener('input', zoom);
    
        canvas.addEventListener('mousedown', (event) => {
            const rect = canvas.getBoundingClientRect();
            dragStartX = event.clientX - rect.left - offsetX;
            dragStartY = event.clientY - rect.top - offsetY;
            isDragging = true;
        });
    
        canvas.addEventListener('mousemove', (event) => {
            if (isDragging) {
                const rect = canvas.getBoundingClientRect();
                offsetX = (event.clientX - rect.left - dragStartX);
                offsetY = (event.clientY - rect.top - dragStartY);
                drawCanvas();
            }
        });
    
        canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });
    
        canvas.addEventListener('mouseout', () => {
            isDragging = false;
        });
    
        canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            if (event.shiftKey) {
                if (event.deltaY < 0) {
                    squareScale *= scaleFactor;
                } else {
                    squareScale /= scaleFactor;
                }
                drawCanvas();
            }
        });
    
        canvas.addEventListener('click', (event) => {
            if (!event.shiftKey) {
                const rect = canvas.getBoundingClientRect();
                const clickX = event.clientX - rect.left;
                const clickY = event.clientY - rect.top;
    
                for (let i = 0; i < redCircles.length; i++) {
                    if (isPointInCircle(clickX, clickY, redCircles[i])) {
                        if (confirm("Do you want to remove this red circle?")) {
                            redCircles.splice(i, 1);
                            displayOrder.splice(i, 1);
                            updateCoordinatesList();
                            drawCanvas();
                        }
                        break;
                    }
                }
            }
        });
    
        document.addEventListener('keydown', handleKeydown);
    
        const modeToggle = document.getElementById('modeToggle');
        modeToggle.addEventListener('change', (e) => {
            const isDarkMode = e.target.checked;
            document.body.classList.toggle('dark-mode', isDarkMode);
            document.querySelector('.controls').classList.toggle('dark-mode', isDarkMode);
            document.querySelector('.coordinates-container').classList.toggle('dark-mode', isDarkMode);
            document.querySelector('.coordinates-heading').classList.toggle('dark-mode', isDarkMode);
            document.querySelectorAll('.arrow-buttons button').forEach(button => button.classList.toggle('dark-mode', isDarkMode));
            document.querySelectorAll('.action-button').forEach(button => button.classList.toggle('dark-mode', isDarkMode));
            document.querySelector('.coordinates').classList.toggle('dark-mode', isDarkMode);
            document.querySelectorAll('.coordinates li:nth-child(even)').forEach(li => li.classList.toggle('dark-mode', isDarkMode));
            canvas.classList.toggle('dark-mode', isDarkMode);
            document.querySelectorAll('.circle-controls fieldset').forEach(fieldset => fieldset.classList.toggle('dark-mode', isDarkMode));
            document.querySelectorAll('.circle-controls legend').forEach(legend => legend.classList.toggle('dark-mode', isDarkMode));
            document.querySelectorAll('.circle-controls label').forEach(label => label.classList.toggle('dark-mode', isDarkMode));
            document.querySelectorAll('input, select').forEach(input => input.classList.toggle('dark-mode', isDarkMode));
            updateCoordinatesList(); // Ensure new circles follow dark mode rules
            drawCanvas();
        });
    
        const alloys = {
            aluminum: ["1000 Series (Commercially Pure Aluminum)", "1050", "1060", "1070", "1100", "2000 Series (Aluminum-Copper Alloys)", "2011", "2014", "2017", "2024", "3000 Series (Aluminum-Manganese Alloys)", "3003", "3004", "3105", "3203", "4000 Series (Aluminum-Silicon Alloys)", "4032", "4043", "4145", "4643", "5000 Series (Aluminum-Magnesium Alloys)", "5005", "5052", "5083", "5086", "5182", "5251", "5454", "5657", "6000 Series (Aluminum-Magnesium-Silicon Alloys)", "6005", "6061", "6063", "6082", "7000 Series (Aluminum-Zinc Alloys)", "7005", "7050", "7075", "7475", "8000 Series (Other Elements)", "8006", "8111", "8500", "8510", "8520"],
            brass: ["C21000 (Gilding Metal)", "C22000 (Commercial Bronze)", "C23000 (Red Brass)", "C24000 (Low Brass)", "C26000 (Cartridge Brass)", "C28000 (Muntz Metal)", "C35300 (Leaded Brass)", "C36000 (Free-Cutting Brass)"],
            bronze: ["C22000 (Commercial Bronze)", "C22600 (Red Brass)", "C51000 (Phosphor Bronze)", "C52100 (Phosphor Bronze)", "C54400 (Phosphor Bronze)", "C90300 (Tin Bronze)", "C90500 (Tin Bronze)", "C90700 (Tin Bronze)", "C93200 (Bearing Bronze)", "C95400 (Aluminum Bronze)", "C95900 (Aluminum Bronze)", "C86300 (Manganese Bronze)"],
            copper: ["Pure Copper (C11000)", "Oxygen-Free Copper (C10100, C10200)", "Deoxidized High-Phosphorus Copper (C12200)", "Electrolytic Tough Pitch (ETP) Copper (C11000)", "Chromium Copper (C18200)", "Beryllium Copper (C17200, C17500, C17510)", "Nickel Silver (C74500, C75200)", "Brass (C26000)", "Phosphor Bronze (C51000)", "Silicon Bronze (C65500)"],
            nickel: ["Nickel 200", "Nickel 201", "Nickel 205", "Nickel 270", "Nickel 400 (Monel 400)", "Nickel 404", "Nickel 600 (Inconel 600)", "Nickel 625 (Inconel 625)", "Nickel 718 (Inconel 718)", "Nickel K500 (Monel K500)", "Nickel 800 (Incoloy 800)", "Nickel 825 (Incoloy 825)"],
            carbonSteel: ["Low Carbon Steel", "1008 Steel", "1010 Steel", "1018 Steel", "1020 Steel", "Medium Carbon Steel", "1040 Steel", "1045 Steel", "1050 Steel", "1060 Steel", "High Carbon Steel", "1070 Steel", "1080 Steel", "1090 Steel", "1095 Steel", "Ultra-High Carbon Steel", "1100 Steel", "1150 Steel", "1200 Steel"],
            alloySteel: ["4140 Alloy Steel", "4340 Alloy Steel", "4130 Alloy Steel", "8620 Alloy Steel", "9310 Alloy Steel", "6150 Alloy Steel", "4340V Alloy Steel", "52100 Alloy Steel", "300M Alloy Steel", "Maraging Steel (18Ni-300, 18Ni-250)", "AISI 4145 Alloy Steel"],
            stainlessSteel: ["Austenitic Stainless Steel", "Ferritic Stainless Steel", "Martensitic Stainless Steel", "Duplex Stainless Steel", "Precipitation-Hardening Stainless Steel"],
            toolSteel: ["A2 Steel", "D2 Steel", "O1 Steel", "M2 Steel", "S7 Steel", "H13 Steel", "W1 Steel"],
            inconel: ["Inconel 600", "Inconel 601", "Inconel 617", "Inconel 625", "Inconel 686", "Inconel 690", "Inconel 693", "Inconel 718", "Inconel 725", "Inconel 750", "Inconel 751", "Inconel 792", "Inconel X-750", "Inconel HX", "Inconel 939"],
            titanium: ["Grade 1 (Pure Titanium)", "Grade 2 (Commercially Pure Titanium)", "Grade 3 (Commercially Pure Titanium)", "Grade 4 (Commercially Pure Titanium)", "Grade 5 (Ti-6Al-4V)", "Grade 6 (Al-4V-2Sn)", "Grade 7 (Ti-0.2Pd)", "Grade 9 (Ti-3Al-2.5V)", "Grade 12 (Ti-0.3Mo-0.8Ni)", "Grade 23 (Ti-6Al-4V ELI)"],
            magnesium: ["AZ31B", "AZ61A", "AZ80A", "ZK60A", "WE43", "Elektron 21", "Magnesium ZM21"],
            zinc: ["Zamak 2", "Zamak 3", "Zamak 5", "Zamak 7", "ZA-8", "ZA-12", "ZA-27", "Zinc 1100", "Zinc 1600", "Zinc 3900"],
            tungsten: ["Pure Tungsten", "Tungsten Carbide", "Heavy Metal Alloys (W-Ni-Fe, W-Ni-Cu)", "Tungsten-Copper Alloys", "Tungsten-Rhenium Alloys", "Tungsten-Thorium Alloys", "Tungsten-Molybdenum Alloys"],
            molybdenum: ["Pure Molybdenum", "Molybdenum-Tungsten Alloys", "Molybdenum-Lanthanum Alloys", "TZM (Titanium-Zirconium-Molybdenum) Alloy", "Molybdenum-Rhenium Alloys"],
            cobalt: ["Cobalt 6B", "Cobalt 6K", "Cobalt L-605", "Cobalt R-41", "Cobalt FSX-414", "Cobalt HS-188", "Cobalt MAR-M-509", "Cobalt MAR-M-918"],
            gold: ["24K Gold (99.9% Pure)", "22K Gold", "18K Gold", "14K Gold", "10K Gold", "White Gold", "Rose Gold", "Green Gold"],
            silver: ["Fine Silver (99.9% Pure)", "Sterling Silver (92.5% Silver, 7.5% Copper)", "Argentium Silver (93.5% or 96% Silver)", "Coin Silver (90% Silver, 10% Copper)", "Britannia Silver (95.8% Silver)"],
            platinum: ["Pt 950 (95% Platinum, 5% Other Metals)", "Pt 900 (90% Platinum, 10% Other Metals)", "Pt 850 (85% Platinum, 15% Other Metals)", "Iridium-Platinum Alloys", "Ruthenium-Platinum Alloys"],
            palladium: ["Pd 500 (50% Palladium, 50% Silver)", "Pd 950 (95% Palladium, 5% Other Metals)", "Pd 999 (99.9% Pure Palladium)", "Palladium-Silver Alloys", "Palladium-Copper Alloys"],
            lead: ["Pure Lead", "Lead-Antimony Alloys", "Lead-Tin Alloys", "Lead-Calcium Alloys", "Lead-Silver Alloys"],
            tin: ["Pure Tin", "Tin-Lead Alloys (Solder)", "Tin-Silver Alloys", "Tin-Copper Alloys (Bronze)", "Tin-Zinc Alloys"],
            zirconium: ["Zirconium 702 (Pure Zirconium)", "Zirconium 704 (Zr-2.5Nb)", "Zirconium 705 (Zr-3Al-2.5Nb)", "Zircaloy-2 (Zr-Sn-Fe-Cr-Ni)", "Zircaloy-4 (Zr-Sn-Fe-Cr)"],
            plastics: ["Polyethylene (PE)", "High-Density Polyethylene (HDPE)", "Low-Density Polyethylene (LDPE)", "Linear Low-Density Polyethylene (LLDPE)", "Polypropylene (PP)", "Polyvinyl Chloride (PVC)", "Polystyrene (PS)", "High Impact Polystyrene (HIPS)", "Expanded Polystyrene (EPS)", "Polyethylene Terephthalate (PET)", "Polycarbonate (PC)", "Acrylonitrile Butadiene Styrene (ABS)", "Nylon (Polyamide, PA)", "Polytetrafluoroethylene (PTFE, Teflon)", "Polyoxymethylene (POM, Acetal)", "Polyethylene Chlorinated (CPE)", "Polyurethane (PU)", "Polylactic Acid (PLA)", "Polyethylene Naphthalate (PEN)", "Polybutylene Terephthalate (PBT)", "Polyetheretherketone (PEEK)", "Polyphenylene Oxide (PPO)", "Polysulfone (PSU)"],
            glass: ["Soda-Lime Glass", "Borosilicate Glass", "Lead Glass (Crystal)", "Aluminosilicate Glass", "Fused Silica Glass", "Chemically Strengthened Glass", "Laminated Glass", "Tempered Glass", "Glass Ceramic", "Optical Glass"],
            wood: ["Hardwood", "Oak", "Maple", "Cherry", "Walnut", "Mahogany", "Teak", "Birch", "Ash", "Beech", "Softwood", "Pine", "Cedar", "Fir", "Spruce", "Redwood", "Hemlock", "Engineered Wood", "Plywood", "Medium Density Fiberboard (MDF)", "Particle Board", "Oriented Strand Board (OSB)", "Laminated Veneer Lumber (LVL)", "Cross-Laminated Timber (CLT)", "Glulam (Glued Laminated Timber)"]
        };
    
        function updateAlloyDropdown() {
            const selectedMetal = metalDropdown.value;
    
            while (alloyDropdown.options.length > 0) {
                alloyDropdown.remove(0);
            }
    
            if (selectedMetal && alloys[selectedMetal]) {
                alloys[selectedMetal].forEach(alloy => {
                    const option = document.createElement('option');
                    option.value = alloy;
                    option.text = alloy;
                    alloyDropdown.add(option);
                });
            } else {
                const option = document.createElement('option');
                option.value = "";
                option.text = "Select Alloy";
                alloyDropdown.add(option);
            }
    
            // Update coordinates list whenever the alloy dropdown changes
            updateCoordinatesList();
        }
    
        metalDropdown.addEventListener('change', updateAlloyDropdown);
        alloyDropdown.addEventListener('change', updateCoordinatesList);
        redCircleDiameterInput.addEventListener('input', updateCoordinatesList);
        toolSelect.addEventListener('change', updateCoordinatesList);
    
        function calculateFeedRate(tool, diameter, material, alloy) {
            // Feed rate calculation logic based on tool, diameter, material, and alloy
            const baseFeedRates = {
                hssDrill: {
                    aluminum: {
                        "1000 Series (Commercially Pure Aluminum)": 0.002, "1050": 0.0021, "1060": 0.0022, "1070": 0.0023, "1100": 0.0024,
                        "2000 Series (Aluminum-Copper Alloys)": 0.0025, "2011": 0.0026, "2014": 0.0027, "2017": 0.0028, "2024": 0.0029,
                        "3000 Series (Aluminum-Manganese Alloys)": 0.003, "3003": 0.0031, "3004": 0.0032, "3105": 0.0033, "3203": 0.0034,
                        "4000 Series (Aluminum-Silicon Alloys)": 0.0035, "4032": 0.0036, "4043": 0.0037, "4145": 0.0038, "4643": 0.0039,
                        "5000 Series (Aluminum-Magnesium Alloys)": 0.004, "5005": 0.0041, "5052": 0.0042, "5083": 0.0043, "5086": 0.0044, "5182": 0.0045, "5251": 0.0046, "5454": 0.0047, "5657": 0.0048,
                        "6000 Series (Aluminum-Magnesium-Silicon Alloys)": 0.005, "6005": 0.0051, "6061": 0.0052, "6063": 0.0053, "6082": 0.0054,
                        "7000 Series (Aluminum-Zinc Alloys)": 0.006, "7005": 0.0061, "7050": 0.0062, "7075": 0.0063, "7475": 0.0064,
                        "8000 Series (Other Elements)": 0.007, "8006": 0.0071, "8111": 0.0072, "8500": 0.0073, "8510": 0.0074, "8520": 0.0075
                    },
                    brass: {
                        "C21000 (Gilding Metal)": 0.003, "C22000 (Commercial Bronze)": 0.0031, "C23000 (Red Brass)": 0.0032, "C24000 (Low Brass)": 0.0033, "C26000 (Cartridge Brass)": 0.0034, "C28000 (Muntz Metal)": 0.0035, "C35300 (Leaded Brass)": 0.0036, "C36000 (Free-Cutting Brass)": 0.0037
                    },
                    bronze: {
                        "C22000 (Commercial Bronze)": 0.002, "C22600 (Red Brass)": 0.0021, "C51000 (Phosphor Bronze)": 0.0022, "C52100 (Phosphor Bronze)": 0.0023, "C54400 (Phosphor Bronze)": 0.0024, "C90300 (Tin Bronze)": 0.0025, "C90500 (Tin Bronze)": 0.0026, "C90700 (Tin Bronze)": 0.0027, "C93200 (Bearing Bronze)": 0.0028, "C95400 (Aluminum Bronze)": 0.0029, "C95900 (Aluminum Bronze)": 0.003, "C86300 (Manganese Bronze)": 0.0031
                    },
                    copper: {
                        "Pure Copper (C11000)": 0.0025, "Oxygen-Free Copper (C10100)": 0.0026, "Deoxidized High-Phosphorus Copper (C12200)": 0.0027, "Electrolytic Tough Pitch (ETP) Copper (C11000)": 0.0028, "Chromium Copper (C18200)": 0.0029, "Beryllium Copper (C17200)": 0.003, "Nickel Silver (C74500)": 0.0031, "Brass (C26000)": 0.0032, "Phosphor Bronze (C51000)": 0.0033, "Silicon Bronze (C65500)": 0.0034
                    },
                    nickel: {
                        "Nickel 200": 0.0015, "Nickel 201": 0.0015, "Nickel 205": 0.0015, "Nickel 270": 0.0016, "Nickel 400 (Monel 400)": 0.0016, "Nickel 404": 0.0016, "Nickel 600 (Inconel 600)": 0.0017, "Nickel 625 (Inconel 625)": 0.0017, "Nickel 718 (Inconel 718)": 0.0018, "Nickel K500 (Monel K500)": 0.0018, "Nickel 800 (Incoloy 800)": 0.0019, "Nickel 825 (Incoloy 825)": 0.0019
                    },
                    carbonSteel: {
                        "Low Carbon Steel": 0.0025, "1008 Steel": 0.0026, "1010 Steel": 0.0027, "1018 Steel": 0.0028, "1020 Steel": 0.0029,
                        "Medium Carbon Steel": 0.003, "1040 Steel": 0.0031, "1045 Steel": 0.0032, "1050 Steel": 0.0033, "1060 Steel": 0.0034,
                        "High Carbon Steel": 0.0035, "1070 Steel": 0.0036, "1080 Steel": 0.0037, "1090 Steel": 0.0038, "1095 Steel": 0.0039,
                        "Ultra-High Carbon Steel": 0.004, "1100 Steel": 0.0041, "1150 Steel": 0.0042, "1200 Steel": 0.0043
                    },
                    alloySteel: {
                        "4140 Alloy Steel": 0.0025, "4340 Alloy Steel": 0.0026, "4130 Alloy Steel": 0.0027, "8620 Alloy Steel": 0.0028, "9310 Alloy Steel": 0.0029,
                        "6150 Alloy Steel": 0.003, "4340V Alloy Steel": 0.0031, "52100 Alloy Steel": 0.0032, "300M Alloy Steel": 0.0033, "Maraging Steel (18Ni-300)": 0.0034, "Maraging Steel (18Ni-250)": 0.0035, "AISI 4145 Alloy Steel": 0.0036
                    },
                    stainlessSteel: {
                        "Austenitic Stainless Steel": 0.0025, "Ferritic Stainless Steel": 0.0026, "Martensitic Stainless Steel": 0.0027, "Duplex Stainless Steel": 0.0028, "Precipitation-Hardening Stainless Steel": 0.0029
                    },
                    toolSteel: {
                        "A2 Steel": 0.0015, "D2 Steel": 0.0016, "O1 Steel": 0.0017, "M2 Steel": 0.0018, "S7 Steel": 0.0019, "H13 Steel": 0.002, "W1 Steel": 0.0021
                    },
                    inconel: {
                        "Inconel 600": 0.0015, "Inconel 601": 0.0016, "Inconel 617": 0.0017, "Inconel 625": 0.0018, "Inconel 686": 0.0019,
                        "Inconel 690": 0.002, "Inconel 693": 0.0021, "Inconel 718": 0.0022, "Inconel 725": 0.0023, "Inconel 750": 0.0024, "Inconel 751": 0.0025, "Inconel 792": 0.0026, "Inconel X-750": 0.0027, "Inconel HX": 0.0028, "Inconel 939": 0.0029
                    },
                    titanium: {
                        "Grade 1 (Pure Titanium)": 0.0015, "Grade 2 (Commercially Pure Titanium)": 0.0016, "Grade 3 (Commercially Pure Titanium)": 0.0017, "Grade 4 (Commercially Pure Titanium)": 0.0018, "Grade 5 (Ti-6Al-4V)": 0.0019,
                        "Grade 6 (Al-4V-2Sn)": 0.002, "Grade 7 (Ti-0.2Pd)": 0.0021, "Grade 9 (Ti-3Al-2.5V)": 0.0022, "Grade 12 (Ti-0.3Mo-0.8Ni)": 0.0023, "Grade 23 (Ti-6Al-4V ELI)": 0.0024
                    },
                    magnesium: {
                        "AZ31B": 0.002, "AZ61A": 0.0021, "AZ80A": 0.0022, "ZK60A": 0.0023, "WE43": 0.0024, "Elektron 21": 0.0025, "Magnesium ZM21": 0.0026
                    },
                    zinc: {
                        "Zamak 2": 0.003, "Zamak 3": 0.0031, "Zamak 5": 0.0032, "Zamak 7": 0.0033, "ZA-8": 0.0034, "ZA-12": 0.0035, "ZA-27": 0.0036, "Zinc 1100": 0.0037, "Zinc 1600": 0.0038, "Zinc 3900": 0.0039
                    },
                    tungsten: {
                        "Pure Tungsten": 0.0015, "Tungsten Carbide": 0.0016, "Heavy Metal Alloys (W-Ni-Fe)": 0.0017, "Heavy Metal Alloys (W-Ni-Cu)": 0.0018, "Tungsten-Copper Alloys": 0.0019,
                        "Tungsten-Rhenium Alloys": 0.002, "Tungsten-Thorium Alloys": 0.0021, "Tungsten-Molybdenum Alloys": 0.0022
                    },
                    molybdenum: {
                        "Pure Molybdenum": 0.0015, "Molybdenum-Tungsten Alloys": 0.0016, "Molybdenum-Lanthanum Alloys": 0.0017, "TZM (Titanium-Zirconium-Molybdenum) Alloy": 0.0018, "Molybdenum-Rhenium Alloys": 0.0019
                    },
                    cobalt: {
                        "Cobalt 6B": 0.0015, "Cobalt 6K": 0.0016, "Cobalt L-605": 0.0017, "Cobalt R-41": 0.0018, "Cobalt FSX-414": 0.0019, "Cobalt HS-188": 0.002, "Cobalt MAR-M-509": 0.0021, "Cobalt MAR-M-918": 0.0022
                    },
                    gold: {
                        "24K Gold (99.9% Pure)": 0.001, "22K Gold": 0.0011, "18K Gold": 0.0012, "14K Gold": 0.0013, "10K Gold": 0.0014, "White Gold": 0.0015, "Rose Gold": 0.0016, "Green Gold": 0.0017
                    },
                    silver: {
                        "Fine Silver (99.9% Pure)": 0.001, "Sterling Silver (92.5% Silver, 7.5% Copper)": 0.0011, "Argentium Silver (93.5% or 96% Silver)": 0.0012, "Coin Silver (90% Silver, 10% Copper)": 0.0013, "Britannia Silver (95.8% Silver)": 0.0014
                    },
                    platinum: {
                        "Pt 950 (95% Platinum, 5% Other Metals)": 0.0015, "Pt 900 (90% Platinum, 10% Other Metals)": 0.0016, "Pt 850 (85% Platinum, 15% Other Metals)": 0.0017, "Iridium-Platinum Alloys": 0.0018, "Ruthenium-Platinum Alloys": 0.0019
                    },
                    palladium: {
                        "Pd 500 (50% Palladium, 50% Silver)": 0.0015, "Pd 950 (95% Palladium, 5% Other Metals)": 0.0016, "Pd 999 (99.9% Pure Palladium)": 0.0017, "Palladium-Silver Alloys": 0.0018, "Palladium-Copper Alloys": 0.0019
                    },
                    lead: {
                        "Pure Lead": 0.001, "Lead-Antimony Alloys": 0.0011, "Lead-Tin Alloys": 0.0012, "Lead-Calcium Alloys": 0.0013, "Lead-Silver Alloys": 0.0014
                    },
                    tin: {
                        "Pure Tin": 0.001, "Tin-Lead Alloys (Solder)": 0.0011, "Tin-Silver Alloys": 0.0012, "Tin-Copper Alloys (Bronze)": 0.0013, "Tin-Zinc Alloys": 0.0014
                    },
                    zirconium: {
                        "Zirconium 702 (Pure Zirconium)": 0.001, "Zirconium 704 (Zr-2.5Nb)": 0.0011, "Zirconium 705 (Zr-3Al-2.5Nb)": 0.0012, "Zircaloy-2 (Zr-Sn-Fe-Cr-Ni)": 0.0013, "Zircaloy-4 (Zr-Sn-Fe-Cr)": 0.0014
                    },
                    plastics: {
                        "Polyethylene (PE)": 0.002, "High-Density Polyethylene (HDPE)": 0.0021, "Low-Density Polyethylene (LDPE)": 0.0022, "Linear Low-Density Polyethylene (LLDPE)": 0.0023,
                        "Polypropylene (PP)": 0.0024, "Polyvinyl Chloride (PVC)": 0.0025, "Polystyrene (PS)": 0.0026, "High Impact Polystyrene (HIPS)": 0.0027, "Expanded Polystyrene (EPS)": 0.0028,
                        "Polyethylene Terephthalate (PET)": 0.0029, "Polycarbonate (PC)": 0.003, "Acrylonitrile Butadiene Styrene (ABS)": 0.0031, "Nylon (Polyamide, PA)": 0.0032,
                        "Polytetrafluoroethylene (PTFE, Teflon)": 0.0033, "Polyoxymethylene (POM, Acetal)": 0.0034, "Polyethylene Chlorinated (CPE)": 0.0035, "Polyurethane (PU)": 0.0036,
                        "Polylactic Acid (PLA)": 0.0037, "Polyethylene Naphthalate (PEN)": 0.0038, "Polybutylene Terephthalate (PBT)": 0.0039, "Polyetheretherketone (PEEK)": 0.004,
                        "Polyphenylene Oxide (PPO)": 0.0041, "Polysulfone (PSU)": 0.0042
                    },
                    glass: {
                        "Soda-Lime Glass": 0.0015, "Borosilicate Glass": 0.0016, "Lead Glass (Crystal)": 0.0017, "Aluminosilicate Glass": 0.0018, "Fused Silica Glass": 0.0019,
                        "Chemically Strengthened Glass": 0.002, "Laminated Glass": 0.0021, "Tempered Glass": 0.0022, "Glass Ceramic": 0.0023, "Optical Glass": 0.0024
                    },
                    wood: {
                        "Hardwood": 0.005, "Oak": 0.0051, "Maple": 0.0052, "Cherry": 0.0053, "Walnut": 0.0054, "Mahogany": 0.0055, "Teak": 0.0056, "Birch": 0.0057, "Ash": 0.0058, "Beech": 0.0059,
                        "Softwood": 0.006, "Pine": 0.0061, "Cedar": 0.0062, "Fir": 0.0063, "Spruce": 0.0064, "Redwood": 0.0065, "Hemlock": 0.0066,
                        "Engineered Wood": 0.0067, "Plywood": 0.0068, "Medium Density Fiberboard (MDF)": 0.0069, "Particle Board": 0.007, "Oriented Strand Board (OSB)": 0.0071, "Laminated Veneer Lumber (LVL)": 0.0072, "Cross-Laminated Timber (CLT)": 0.0073, "Glulam (Glued Laminated Timber)": 0.0074
                    }
                },
                carbideDrill: {
                    aluminum: {
                        "1000 Series (Commercially Pure Aluminum)": 0.005, "1050": 0.0051, "1060": 0.0052, "1070": 0.0053, "1100": 0.0054,
                        "2000 Series (Aluminum-Copper Alloys)": 0.0055, "2011": 0.0056, "2014": 0.0057, "2017": 0.0058, "2024": 0.0059,
                        "3000 Series (Aluminum-Manganese Alloys)": 0.006, "3003": 0.0061, "3004": 0.0062, "3105": 0.0063, "3203": 0.0064,
                        "4000 Series (Aluminum-Silicon Alloys)": 0.0065, "4032": 0.0066, "4043": 0.0067, "4145": 0.0068, "4643": 0.0069,
                        "5000 Series (Aluminum-Magnesium Alloys)": 0.007, "5005": 0.0071, "5052": 0.0072, "5083": 0.0073, "5086": 0.0074, "5182": 0.0075, "5251": 0.0076, "5454": 0.0077, "5657": 0.0078,
                        "6000 Series (Aluminum-Magnesium-Silicon Alloys)": 0.008, "6005": 0.0081, "6061": 0.0082, "6063": 0.0083, "6082": 0.0084,
                        "7000 Series (Aluminum-Zinc Alloys)": 0.009, "7005": 0.0091, "7050": 0.0092, "7075": 0.0093, "7475": 0.0094,
                        "8000 Series (Other Elements)": 0.01, "8006": 0.0101, "8111": 0.0102, "8500": 0.0103, "8510": 0.0104, "8520": 0.0105
                    },
                    brass: {
                        "C21000 (Gilding Metal)": 0.006, "C22000 (Commercial Bronze)": 0.0061, "C23000 (Red Brass)": 0.0062, "C24000 (Low Brass)": 0.0063, "C26000 (Cartridge Brass)": 0.0064, "C28000 (Muntz Metal)": 0.0065, "C35300 (Leaded Brass)": 0.0066, "C36000 (Free-Cutting Brass)": 0.0067
                    },
                    bronze: {
                        "C22000 (Commercial Bronze)": 0.004, "C22600 (Red Brass)": 0.0041, "C51000 (Phosphor Bronze)": 0.0042, "C52100 (Phosphor Bronze)": 0.0043, "C54400 (Phosphor Bronze)": 0.0044, "C90300 (Tin Bronze)": 0.0045, "C90500 (Tin Bronze)": 0.0046, "C90700 (Tin Bronze)": 0.0047, "C93200 (Bearing Bronze)": 0.0048, "C95400 (Aluminum Bronze)": 0.0049, "C95900 (Aluminum Bronze)": 0.005, "C86300 (Manganese Bronze)": 0.0051
                    },
                    copper: {
                        "Pure Copper (C11000)": 0.0045, "Oxygen-Free Copper (C10100)": 0.0046, "Deoxidized High-Phosphorus Copper (C12200)": 0.0047, "Electrolytic Tough Pitch (ETP) Copper (C11000)": 0.0048, "Chromium Copper (C18200)": 0.0049, "Beryllium Copper (C17200)": 0.005, "Nickel Silver (C74500)": 0.0051, "Brass (C26000)": 0.0052, "Phosphor Bronze (C51000)": 0.0053, "Silicon Bronze (C65500)": 0.0054
                    },
                    nickel: {
                        "Nickel 200": 0.003, "Nickel 201": 0.0031, "Nickel 205": 0.0032, "Nickel 270": 0.0033, "Nickel 400 (Monel 400)": 0.0034, "Nickel 404": 0.0035, "Nickel 600 (Inconel 600)": 0.0036, "Nickel 625 (Inconel 625)": 0.0037, "Nickel 718 (Inconel 718)": 0.0038, "Nickel K500 (Monel K500)": 0.0039, "Nickel 800 (Incoloy 800)": 0.004, "Nickel 825 (Incoloy 825)": 0.0041
                    },
                    carbonSteel: {
                        "Low Carbon Steel": 0.005, "1008 Steel": 0.0051, "1010 Steel": 0.0052, "1018 Steel": 0.0053, "1020 Steel": 0.0054,
                        "Medium Carbon Steel": 0.0055, "1040 Steel": 0.0056, "1045 Steel": 0.0057, "1050 Steel": 0.0058, "1060 Steel": 0.0059,
                        "High Carbon Steel": 0.006, "1070 Steel": 0.0061, "1080 Steel": 0.0062, "1090 Steel": 0.0063, "1095 Steel": 0.0064,
                        "Ultra-High Carbon Steel": 0.0065, "1100 Steel": 0.0066, "1150 Steel": 0.0067, "1200 Steel": 0.0068
                    },
                    alloySteel: {
                        "4140 Alloy Steel": 0.004, "4340 Alloy Steel": 0.0041, "4130 Alloy Steel": 0.0042, "8620 Alloy Steel": 0.0043, "9310 Alloy Steel": 0.0044,
                        "6150 Alloy Steel": 0.0045, "4340V Alloy Steel": 0.0046, "52100 Alloy Steel": 0.0047, "300M Alloy Steel": 0.0048, "Maraging Steel (18Ni-300)": 0.0049, "Maraging Steel (18Ni-250)": 0.005, "AISI 4145 Alloy Steel": 0.0051
                    },
                    stainlessSteel: {
                        "Austenitic Stainless Steel": 0.003, "Ferritic Stainless Steel": 0.0031, "Martensitic Stainless Steel": 0.0032, "Duplex Stainless Steel": 0.0033, "Precipitation-Hardening Stainless Steel": 0.0034
                    },
                    toolSteel: {
                        "A2 Steel": 0.0025, "D2 Steel": 0.0026, "O1 Steel": 0.0027, "M2 Steel": 0.0028, "S7 Steel": 0.0029, "H13 Steel": 0.003, "W1 Steel": 0.0031
                    },
                    inconel: {
                        "Inconel 600": 0.0025, "Inconel 601": 0.0026, "Inconel 617": 0.0027, "Inconel 625": 0.0028, "Inconel 686": 0.0029,
                        "Inconel 690": 0.003, "Inconel 693": 0.0031, "Inconel 718": 0.0032, "Inconel 725": 0.0033, "Inconel 750": 0.0034, "Inconel 751": 0.0035, "Inconel 792": 0.0036, "Inconel X-750": 0.0037, "Inconel HX": 0.0038, "Inconel 939": 0.0039
                    },
                    titanium: {
                        "Grade 1 (Pure Titanium)": 0.0025, "Grade 2 (Commercially Pure Titanium)": 0.0026, "Grade 3 (Commercially Pure Titanium)": 0.0027, "Grade 4 (Commercially Pure Titanium)": 0.0028, "Grade 5 (Ti-6Al-4V)": 0.0029,
                        "Grade 6 (Al-4V-2Sn)": 0.003, "Grade 7 (Ti-0.2Pd)": 0.0031, "Grade 9 (Ti-3Al-2.5V)": 0.0032, "Grade 12 (Ti-0.3Mo-0.8Ni)": 0.0033, "Grade 23 (Ti-6Al-4V ELI)": 0.0034
                    },
                    magnesium: {
                        "AZ31B": 0.004, "AZ61A": 0.0041, "AZ80A": 0.0042, "ZK60A": 0.0043, "WE43": 0.0044, "Elektron 21": 0.0045, "Magnesium ZM21": 0.0046
                    },
                    zinc: {
                        "Zamak 2": 0.006, "Zamak 3": 0.0061, "Zamak 5": 0.0062, "Zamak 7": 0.0063, "ZA-8": 0.0064, "ZA-12": 0.0065, "ZA-27": 0.0066, "Zinc 1100": 0.0067, "Zinc 1600": 0.0068, "Zinc 3900": 0.0069
                    },
                    tungsten: {
                        "Pure Tungsten": 0.003, "Tungsten Carbide": 0.0031, "Heavy Metal Alloys (W-Ni-Fe)": 0.0032, "Heavy Metal Alloys (W-Ni-Cu)": 0.0033, "Tungsten-Copper Alloys": 0.0034,
                        "Tungsten-Rhenium Alloys": 0.0035, "Tungsten-Thorium Alloys": 0.0036, "Tungsten-Molybdenum Alloys": 0.0037
                    },
                    molybdenum: {
                        "Pure Molybdenum": 0.0025, "Molybdenum-Tungsten Alloys": 0.0026, "Molybdenum-Lanthanum Alloys": 0.0027, "TZM (Titanium-Zirconium-Molybdenum) Alloy": 0.0028, "Molybdenum-Rhenium Alloys": 0.0029
                    },
                    cobalt: {
                        "Cobalt 6B": 0.0025, "Cobalt 6K": 0.0026, "Cobalt L-605": 0.0027, "Cobalt R-41": 0.0028, "Cobalt FSX-414": 0.0029, "Cobalt HS-188": 0.003, "Cobalt MAR-M-509": 0.0031, "Cobalt MAR-M-918": 0.0032
                    },
                    gold: {
                        "24K Gold (99.9% Pure)": 0.002, "22K Gold": 0.0021, "18K Gold": 0.0022, "14K Gold": 0.0023, "10K Gold": 0.0024, "White Gold": 0.0025, "Rose Gold": 0.0026, "Green Gold": 0.0027
                    },
                    silver: {
                        "Fine Silver (99.9% Pure)": 0.002, "Sterling Silver (92.5% Silver, 7.5% Copper)": 0.0021, "Argentium Silver (93.5% or 96% Silver)": 0.0022, "Coin Silver (90% Silver, 10% Copper)": 0.0023, "Britannia Silver (95.8% Silver)": 0.0024
                    },
                    platinum: {
                        "Pt 950 (95% Platinum, 5% Other Metals)": 0.0025, "Pt 900 (90% Platinum, 10% Other Metals)": 0.0026, "Pt 850 (85% Platinum, 15% Other Metals)": 0.0027, "Iridium-Platinum Alloys": 0.0028, "Ruthenium-Platinum Alloys": 0.0029
                    },
                    palladium: {
                        "Pd 500 (50% Palladium, 50% Silver)": 0.0025, "Pd 950 (95% Palladium, 5% Other Metals)": 0.0026, "Pd 999 (99.9% Pure Palladium)": 0.0027, "Palladium-Silver Alloys": 0.0028, "Palladium-Copper Alloys": 0.0029
                    },
                    lead: {
                        "Pure Lead": 0.002, "Lead-Antimony Alloys": 0.0021, "Lead-Tin Alloys": 0.0022, "Lead-Calcium Alloys": 0.0023, "Lead-Silver Alloys": 0.0024
                    },
                    tin: {
                        "Pure Tin": 0.002, "Tin-Lead Alloys (Solder)": 0.0021, "Tin-Silver Alloys": 0.0022, "Tin-Copper Alloys (Bronze)": 0.0023, "Tin-Zinc Alloys": 0.0024
                    },
                    zirconium: {
                        "Zirconium 702 (Pure Zirconium)": 0.002, "Zirconium 704 (Zr-2.5Nb)": 0.0021, "Zirconium 705 (Zr-3Al-2.5Nb)": 0.0022, "Zircaloy-2 (Zr-Sn-Fe-Cr-Ni)": 0.0023, "Zircaloy-4 (Zr-Sn-Fe-Cr)": 0.0024
                    },
                    plastics: {
                        "Polyethylene (PE)": 0.004, "High-Density Polyethylene (HDPE)": 0.0041, "Low-Density Polyethylene (LDPE)": 0.0042, "Linear Low-Density Polyethylene (LLDPE)": 0.0043,
                        "Polypropylene (PP)": 0.0044, "Polyvinyl Chloride (PVC)": 0.0045, "Polystyrene (PS)": 0.0046, "High Impact Polystyrene (HIPS)": 0.0047, "Expanded Polystyrene (EPS)": 0.0048,
                        "Polyethylene Terephthalate (PET)": 0.0049, "Polycarbonate (PC)": 0.005, "Acrylonitrile Butadiene Styrene (ABS)": 0.0051, "Nylon (Polyamide, PA)": 0.0052,
                        "Polytetrafluoroethylene (PTFE, Teflon)": 0.0053, "Polyoxymethylene (POM, Acetal)": 0.0054, "Polyethylene Chlorinated (CPE)": 0.0055, "Polyurethane (PU)": 0.0056,
                        "Polylactic Acid (PLA)": 0.0057, "Polyethylene Naphthalate (PEN)": 0.0058, "Polybutylene Terephthalate (PBT)": 0.0059, "Polyetheretherketone (PEEK)": 0.006,
                        "Polyphenylene Oxide (PPO)": 0.0061, "Polysulfone (PSU)": 0.0062
                    },
                    glass: {
                        "Soda-Lime Glass": 0.003, "Borosilicate Glass": 0.0031, "Lead Glass (Crystal)": 0.0032, "Aluminosilicate Glass": 0.0033, "Fused Silica Glass": 0.0034,
                        "Chemically Strengthened Glass": 0.0035, "Laminated Glass": 0.0036, "Tempered Glass": 0.0037, "Glass Ceramic": 0.0038, "Optical Glass": 0.0039
                    },
                    wood: {
                        "Hardwood": 0.01, "Oak": 0.0101, "Maple": 0.0102, "Cherry": 0.0103, "Walnut": 0.0104, "Mahogany": 0.0105, "Teak": 0.0106, "Birch": 0.0107, "Ash": 0.0108, "Beech": 0.0109,
                        "Softwood": 0.011, "Pine": 0.0111, "Cedar": 0.0112, "Fir": 0.0113, "Spruce": 0.0114, "Redwood": 0.0115, "Hemlock": 0.0116,
                        "Engineered Wood": 0.0117, "Plywood": 0.0118, "Medium Density Fiberboard (MDF)": 0.0119, "Particle Board": 0.012, "Oriented Strand Board (OSB)": 0.0121, "Laminated Veneer Lumber (LVL)": 0.0122, "Cross-Laminated Timber (CLT)": 0.0123, "Glulam (Glued Laminated Timber)": 0.0124
                    }
                },
                insertDrill: {
                    aluminum: {
                        "1000 Series (Commercially Pure Aluminum)": 0.002, "1050": 0.0021, "1060": 0.0022, "1070": 0.0023, "1100": 0.0024,
                        "2000 Series (Aluminum-Copper Alloys)": 0.0025, "2011": 0.0026, "2014": 0.0027, "2017": 0.0028, "2024": 0.0029,
                        "3000 Series (Aluminum-Manganese Alloys)": 0.003, "3003": 0.0031, "3004": 0.0032, "3105": 0.0033, "3203": 0.0034,
                        "4000 Series (Aluminum-Silicon Alloys)": 0.0035, "4032": 0.0036, "4043": 0.0037, "4145": 0.0038, "4643": 0.0039,
                        "5000 Series (Aluminum-Magnesium Alloys)": 0.004, "5005": 0.0041, "5052": 0.0042, "5083": 0.0043, "5086": 0.0044, "5182": 0.0045, "5251": 0.0046, "5454": 0.0047, "5657": 0.0048,
                        "6000 Series (Aluminum-Magnesium-Silicon Alloys)": 0.005, "6005": 0.0051, "6061": 0.0052, "6063": 0.0053, "6082": 0.0054,
                        "7000 Series (Aluminum-Zinc Alloys)": 0.006, "7005": 0.0061, "7050": 0.0062, "7075": 0.0063, "7475": 0.0064,
                        "8000 Series (Other Elements)": 0.007, "8006": 0.0071, "8111": 0.0072, "8500": 0.0073, "8510": 0.0074, "8520": 0.0075
                    },
                    brass: {
                        "C21000 (Gilding Metal)": 0.003, "C22000 (Commercial Bronze)": 0.0031, "C23000 (Red Brass)": 0.0032, "C24000 (Low Brass)": 0.0033, "C26000 (Cartridge Brass)": 0.0034, "C28000 (Muntz Metal)": 0.0035, "C35300 (Leaded Brass)": 0.0036, "C36000 (Free-Cutting Brass)": 0.0037
                    },
                    bronze: {
                        "C22000 (Commercial Bronze)": 0.002, "C22600 (Red Brass)": 0.0021, "C51000 (Phosphor Bronze)": 0.0022, "C52100 (Phosphor Bronze)": 0.0023, "C54400 (Phosphor Bronze)": 0.0024, "C90300 (Tin Bronze)": 0.0025, "C90500 (Tin Bronze)": 0.0026, "C90700 (Tin Bronze)": 0.0027, "C93200 (Bearing Bronze)": 0.0028, "C95400 (Aluminum Bronze)": 0.0029, "C95900 (Aluminum Bronze)": 0.003, "C86300 (Manganese Bronze)": 0.0031
                    },
                    copper: {
                        "Pure Copper (C11000)": 0.0025, "Oxygen-Free Copper (C10100)": 0.0026, "Deoxidized High-Phosphorus Copper (C12200)": 0.0027, "Electrolytic Tough Pitch (ETP) Copper (C11000)": 0.0028, "Chromium Copper (C18200)": 0.0029, "Beryllium Copper (C17200)": 0.003, "Nickel Silver (C74500)": 0.0031, "Brass (C26000)": 0.0032, "Phosphor Bronze (C51000)": 0.0033, "Silicon Bronze (C65500)": 0.0034
                    },
                    nickel: {
                        "Nickel 200": 0.0015, "Nickel 201": 0.0015, "Nickel 205": 0.0015, "Nickel 270": 0.0016, "Nickel 400 (Monel 400)": 0.0016, "Nickel 404": 0.0016, "Nickel 600 (Inconel 600)": 0.0017, "Nickel 625 (Inconel 625)": 0.0017, "Nickel 718 (Inconel 718)": 0.0018, "Nickel K500 (Monel K500)": 0.0018, "Nickel 800 (Incoloy 800)": 0.0019, "Nickel 825 (Incoloy 825)": 0.0019
                    },
                    carbonSteel: {
                        "Low Carbon Steel": 0.0025, "1008 Steel": 0.0026, "1010 Steel": 0.0027, "1018 Steel": 0.0028, "1020 Steel": 0.0029,
                        "Medium Carbon Steel": 0.003, "1040 Steel": 0.0031, "1045 Steel": 0.0032, "1050 Steel": 0.0033, "1060 Steel": 0.0034,
                        "High Carbon Steel": 0.0035, "1070 Steel": 0.0036, "1080 Steel": 0.0037, "1090 Steel": 0.0038, "1095 Steel": 0.0039,
                        "Ultra-High Carbon Steel": 0.004, "1100 Steel": 0.0041, "1150 Steel": 0.0042, "1200 Steel": 0.0043
                    },
                    alloySteel: {
                        "4140 Alloy Steel": 0.0025, "4340 Alloy Steel": 0.0026, "4130 Alloy Steel": 0.0027, "8620 Alloy Steel": 0.0028, "9310 Alloy Steel": 0.0029,
                        "6150 Alloy Steel": 0.003, "4340V Alloy Steel": 0.0031, "52100 Alloy Steel": 0.0032, "300M Alloy Steel": 0.0033, "Maraging Steel (18Ni-300)": 0.0034, "Maraging Steel (18Ni-250)": 0.0035, "AISI 4145 Alloy Steel": 0.0036
                    },
                    stainlessSteel: {
                        "Austenitic Stainless Steel": 0.0025, "Ferritic Stainless Steel": 0.0026, "Martensitic Stainless Steel": 0.0027, "Duplex Stainless Steel": 0.0028, "Precipitation-Hardening Stainless Steel": 0.0029
                    },
                    toolSteel: {
                        "A2 Steel": 0.0015, "D2 Steel": 0.0016, "O1 Steel": 0.0017, "M2 Steel": 0.0018, "S7 Steel": 0.0019, "H13 Steel": 0.002, "W1 Steel": 0.0021
                    },
                    inconel: {
                        "Inconel 600": 0.0015, "Inconel 601": 0.0016, "Inconel 617": 0.0017, "Inconel 625": 0.0018, "Inconel 686": 0.0019,
                        "Inconel 690": 0.002, "Inconel 693": 0.0021, "Inconel 718": 0.0022, "Inconel 725": 0.0023, "Inconel 750": 0.0024, "Inconel 751": 0.0025, "Inconel 792": 0.0026, "Inconel X-750": 0.0027, "Inconel HX": 0.0028, "Inconel 939": 0.0029
                    },
                    titanium: {
                        "Grade 1 (Pure Titanium)": 0.0015, "Grade 2 (Commercially Pure Titanium)": 0.0016, "Grade 3 (Commercially Pure Titanium)": 0.0017, "Grade 4 (Commercially Pure Titanium)": 0.0018, "Grade 5 (Ti-6Al-4V)": 0.0019,
                        "Grade 6 (Al-4V-2Sn)": 0.002, "Grade 7 (Ti-0.2Pd)": 0.0021, "Grade 9 (Ti-3Al-2.5V)": 0.0022, "Grade 12 (Ti-0.3Mo-0.8Ni)": 0.0023, "Grade 23 (Ti-6Al-4V ELI)": 0.0024
                    },
                    magnesium: {
                        "AZ31B": 0.002, "AZ61A": 0.0021, "AZ80A": 0.0022, "ZK60A": 0.0023, "WE43": 0.0024, "Elektron 21": 0.0025, "Magnesium ZM21": 0.0026
                    },
                    zinc: {
                        "Zamak 2": 0.003, "Zamak 3": 0.0031, "Zamak 5": 0.0032, "Zamak 7": 0.0033, "ZA-8": 0.0034, "ZA-12": 0.0035, "ZA-27": 0.0036, "Zinc 1100": 0.0037, "Zinc 1600": 0.0038, "Zinc 3900": 0.0039
                    },
                    tungsten: {
                        "Pure Tungsten": 0.0015, "Tungsten Carbide": 0.0016, "Heavy Metal Alloys (W-Ni-Fe)": 0.0017, "Heavy Metal Alloys (W-Ni-Cu)": 0.0018, "Tungsten-Copper Alloys": 0.0019,
                        "Tungsten-Rhenium Alloys": 0.002, "Tungsten-Thorium Alloys": 0.0021, "Tungsten-Molybdenum Alloys": 0.0022
                    },
                    molybdenum: {
                        "Pure Molybdenum": 0.0015, "Molybdenum-Tungsten Alloys": 0.0016, "Molybdenum-Lanthanum Alloys": 0.0017, "TZM (Titanium-Zirconium-Molybdenum) Alloy": 0.0018, "Molybdenum-Rhenium Alloys": 0.0019
                    },
                    cobalt: {
                        "Cobalt 6B": 0.0015, "Cobalt 6K": 0.0016, "Cobalt L-605": 0.0017, "Cobalt R-41": 0.0018, "Cobalt FSX-414": 0.0019, "Cobalt HS-188": 0.002, "Cobalt MAR-M-509": 0.0021, "Cobalt MAR-M-918": 0.0022
                    },
                    gold: {
                        "24K Gold (99.9% Pure)": 0.001, "22K Gold": 0.0011, "18K Gold": 0.0012, "14K Gold": 0.0013, "10K Gold": 0.0014, "White Gold": 0.0015, "Rose Gold": 0.0016, "Green Gold": 0.0017
                    },
                    silver: {
                        "Fine Silver (99.9% Pure)": 0.001, "Sterling Silver (92.5% Silver, 7.5% Copper)": 0.0011, "Argentium Silver (93.5% or 96% Silver)": 0.0012, "Coin Silver (90% Silver, 10% Copper)": 0.0013, "Britannia Silver (95.8% Silver)": 0.0014
                    },
                    platinum: {
                        "Pt 950 (95% Platinum, 5% Other Metals)": 0.0015, "Pt 900 (90% Platinum, 10% Other Metals)": 0.0016, "Pt 850 (85% Platinum, 15% Other Metals)": 0.0017, "Iridium-Platinum Alloys": 0.0018, "Ruthenium-Platinum Alloys": 0.0019
                    },
                    palladium: {
                        "Pd 500 (50% Palladium, 50% Silver)": 0.0015, "Pd 950 (95% Palladium, 5% Other Metals)": 0.0016, "Pd 999 (99.9% Pure Palladium)": 0.0017, "Palladium-Silver Alloys": 0.0018, "Palladium-Copper Alloys": 0.0019
                    },
                    lead: {
                        "Pure Lead": 0.001, "Lead-Antimony Alloys": 0.0011, "Lead-Tin Alloys": 0.0012, "Lead-Calcium Alloys": 0.0013, "Lead-Silver Alloys": 0.0014
                    },
                    tin: {
                        "Pure Tin": 0.001, "Tin-Lead Alloys (Solder)": 0.0011, "Tin-Silver Alloys": 0.0012, "Tin-Copper Alloys (Bronze)": 0.0013, "Tin-Zinc Alloys": 0.0014
                    },
                    zirconium: {
                        "Zirconium 702 (Pure Zirconium)": 0.001, "Zirconium 704 (Zr-2.5Nb)": 0.0011, "Zirconium 705 (Zr-3Al-2.5Nb)": 0.0012, "Zircaloy-2 (Zr-Sn-Fe-Cr-Ni)": 0.0013, "Zircaloy-4 (Zr-Sn-Fe-Cr)": 0.0014
                    },
                    plastics: {
                        "Polyethylene (PE)": 0.002, "High-Density Polyethylene (HDPE)": 0.0021, "Low-Density Polyethylene (LDPE)": 0.0022, "Linear Low-Density Polyethylene (LLDPE)": 0.0023,
                        "Polypropylene (PP)": 0.0024, "Polyvinyl Chloride (PVC)": 0.0025, "Polystyrene (PS)": 0.0026, "High Impact Polystyrene (HIPS)": 0.0027, "Expanded Polystyrene (EPS)": 0.0028,
                        "Polyethylene Terephthalate (PET)": 0.0029, "Polycarbonate (PC)": 0.003, "Acrylonitrile Butadiene Styrene (ABS)": 0.0031, "Nylon (Polyamide, PA)": 0.0032,
                        "Polytetrafluoroethylene (PTFE, Teflon)": 0.0033, "Polyoxymethylene (POM, Acetal)": 0.0034, "Polyethylene Chlorinated (CPE)": 0.0035, "Polyurethane (PU)": 0.0036,
                        "Polylactic Acid (PLA)": 0.0037, "Polyethylene Naphthalate (PEN)": 0.0038, "Polybutylene Terephthalate (PBT)": 0.0039, "Polyetheretherketone (PEEK)": 0.004,
                        "Polyphenylene Oxide (PPO)": 0.0041, "Polysulfone (PSU)": 0.0042
                    },
                    glass: {
                        "Soda-Lime Glass": 0.0015, "Borosilicate Glass": 0.0016, "Lead Glass (Crystal)": 0.0017, "Aluminosilicate Glass": 0.0018, "Fused Silica Glass": 0.0019,
                        "Chemically Strengthened Glass": 0.002, "Laminated Glass": 0.0021, "Tempered Glass": 0.0022, "Glass Ceramic": 0.0023, "Optical Glass": 0.0024
                    },
                    wood: {
                        "Hardwood": 0.005, "Oak": 0.0051, "Maple": 0.0052, "Cherry": 0.0053, "Walnut": 0.0054, "Mahogany": 0.0055, "Teak": 0.0056, "Birch": 0.0057, "Ash": 0.0058, "Beech": 0.0059,
                        "Softwood": 0.006, "Pine": 0.0061, "Cedar": 0.0062, "Fir": 0.0063, "Spruce": 0.0064, "Redwood": 0.0065, "Hemlock": 0.0066,
                        "Engineered Wood": 0.0067, "Plywood": 0.0068, "Medium Density Fiberboard (MDF)": 0.0069, "Particle Board": 0.007, "Oriented Strand Board (OSB)": 0.0071, "Laminated Veneer Lumber (LVL)": 0.0072, "Cross-Laminated Timber (CLT)": 0.0073, "Glulam (Glued Laminated Timber)": 0.0074
                    }
                },
                flatBottomDrill: {
                    aluminum: {
                        "1000 Series (Commercially Pure Aluminum)": 0.002, "1050": 0.0021, "1060": 0.0022, "1070": 0.0023, "1100": 0.0024,
                        "2000 Series (Aluminum-Copper Alloys)": 0.0025, "2011": 0.0026, "2014": 0.0027, "2017": 0.0028, "2024": 0.0029,
                        "3000 Series (Aluminum-Manganese Alloys)": 0.003, "3003": 0.0031, "3004": 0.0032, "3105": 0.0033, "3203": 0.0034,
                        "4000 Series (Aluminum-Silicon Alloys)": 0.0035, "4032": 0.0036, "4043": 0.0037, "4145": 0.0038, "4643": 0.0039,
                        "5000 Series (Aluminum-Magnesium Alloys)": 0.004, "5005": 0.0041, "5052": 0.0042, "5083": 0.0043, "5086": 0.0044, "5182": 0.0045, "5251": 0.0046, "5454": 0.0047, "5657": 0.0048,
                        "6000 Series (Aluminum-Magnesium-Silicon Alloys)": 0.005, "6005": 0.0051, "6061": 0.0052, "6063": 0.0053, "6082": 0.0054,
                        "7000 Series (Aluminum-Zinc Alloys)": 0.006, "7005": 0.0061, "7050": 0.0062, "7075": 0.0063, "7475": 0.0064,
                        "8000 Series (Other Elements)": 0.007, "8006": 0.0071, "8111": 0.0072, "8500": 0.0073, "8510": 0.0074, "8520": 0.0075
                    },
                    brass: {
                        "C21000 (Gilding Metal)": 0.003, "C22000 (Commercial Bronze)": 0.0031, "C23000 (Red Brass)": 0.0032, "C24000 (Low Brass)": 0.0033, "C26000 (Cartridge Brass)": 0.0034, "C28000 (Muntz Metal)": 0.0035, "C35300 (Leaded Brass)": 0.0036, "C36000 (Free-Cutting Brass)": 0.0037
                    },
                    bronze: {
                        "C22000 (Commercial Bronze)": 0.002, "C22600 (Red Brass)": 0.0021, "C51000 (Phosphor Bronze)": 0.0022, "C52100 (Phosphor Bronze)": 0.0023, "C54400 (Phosphor Bronze)": 0.0024, "C90300 (Tin Bronze)": 0.0025, "C90500 (Tin Bronze)": 0.0026, "C90700 (Tin Bronze)": 0.0027, "C93200 (Bearing Bronze)": 0.0028, "C95400 (Aluminum Bronze)": 0.0029, "C95900 (Aluminum Bronze)": 0.003, "C86300 (Manganese Bronze)": 0.0031
                    },
                    copper: {
                        "Pure Copper (C11000)": 0.0025, "Oxygen-Free Copper (C10100)": 0.0026, "Deoxidized High-Phosphorus Copper (C12200)": 0.0027, "Electrolytic Tough Pitch (ETP) Copper (C11000)": 0.0028, "Chromium Copper (C18200)": 0.0029, "Beryllium Copper (C17200)": 0.003, "Nickel Silver (C74500)": 0.0031, "Brass (C26000)": 0.0032, "Phosphor Bronze (C51000)": 0.0033, "Silicon Bronze (C65500)": 0.0034
                    },
                    nickel: {
                        "Nickel 200": 0.0015, "Nickel 201": 0.0015, "Nickel 205": 0.0015, "Nickel 270": 0.0016, "Nickel 400 (Monel 400)": 0.0016, "Nickel 404": 0.0016, "Nickel 600 (Inconel 600)": 0.0017, "Nickel 625 (Inconel 625)": 0.0017, "Nickel 718 (Inconel 718)": 0.0018, "Nickel K500 (Monel K500)": 0.0018, "Nickel 800 (Incoloy 800)": 0.0019, "Nickel 825 (Incoloy 825)": 0.0019
                    },
                    carbonSteel: {
                        "Low Carbon Steel": 0.0025, "1008 Steel": 0.0026, "1010 Steel": 0.0027, "1018 Steel": 0.0028, "1020 Steel": 0.0029,
                        "Medium Carbon Steel": 0.003, "1040 Steel": 0.0031, "1045 Steel": 0.0032, "1050 Steel": 0.0033, "1060 Steel": 0.0034,
                        "High Carbon Steel": 0.0035, "1070 Steel": 0.0036, "1080 Steel": 0.0037, "1090 Steel": 0.0038, "1095 Steel": 0.0039,
                        "Ultra-High Carbon Steel": 0.004, "1100 Steel": 0.0041, "1150 Steel": 0.0042, "1200 Steel": 0.0043
                    },
                    alloySteel: {
                        "4140 Alloy Steel": 0.0025, "4340 Alloy Steel": 0.0026, "4130 Alloy Steel": 0.0027, "8620 Alloy Steel": 0.0028, "9310 Alloy Steel": 0.0029,
                        "6150 Alloy Steel": 0.003, "4340V Alloy Steel": 0.0031, "52100 Alloy Steel": 0.0032, "300M Alloy Steel": 0.0033, "Maraging Steel (18Ni-300)": 0.0034, "Maraging Steel (18Ni-250)": 0.0035, "AISI 4145 Alloy Steel": 0.0036
                    },
                    stainlessSteel: {
                        "Austenitic Stainless Steel": 0.0025, "Ferritic Stainless Steel": 0.0026, "Martensitic Stainless Steel": 0.0027, "Duplex Stainless Steel": 0.0028, "Precipitation-Hardening Stainless Steel": 0.0029
                    },
                    toolSteel: {
                        "A2 Steel": 0.0015, "D2 Steel": 0.0016, "O1 Steel": 0.0017, "M2 Steel": 0.0018, "S7 Steel": 0.0019, "H13 Steel": 0.002, "W1 Steel": 0.0021
                    },
                    inconel: {
                        "Inconel 600": 0.0015, "Inconel 601": 0.0016, "Inconel 617": 0.0017, "Inconel 625": 0.0018, "Inconel 686": 0.0019,
                        "Inconel 690": 0.002, "Inconel 693": 0.0021, "Inconel 718": 0.0022, "Inconel 725": 0.0023, "Inconel 750": 0.0024, "Inconel 751": 0.0025, "Inconel 792": 0.0026, "Inconel X-750": 0.0027, "Inconel HX": 0.0028, "Inconel 939": 0.0029
                    },
                    titanium: {
                        "Grade 1 (Pure Titanium)": 0.0015, "Grade 2 (Commercially Pure Titanium)": 0.0016, "Grade 3 (Commercially Pure Titanium)": 0.0017, "Grade 4 (Commercially Pure Titanium)": 0.0018, "Grade 5 (Ti-6Al-4V)": 0.0019,
                        "Grade 6 (Al-4V-2Sn)": 0.002, "Grade 7 (Ti-0.2Pd)": 0.0021, "Grade 9 (Ti-3Al-2.5V)": 0.0022, "Grade 12 (Ti-0.3Mo-0.8Ni)": 0.0023, "Grade 23 (Ti-6Al-4V ELI)": 0.0024
                    },
                    magnesium: {
                        "AZ31B": 0.002, "AZ61A": 0.0021, "AZ80A": 0.0022, "ZK60A": 0.0023, "WE43": 0.0024, "Elektron 21": 0.0025, "Magnesium ZM21": 0.0026
                    },
                    zinc: {
                        "Zamak 2": 0.003, "Zamak 3": 0.0031, "Zamak 5": 0.0032, "Zamak 7": 0.0033, "ZA-8": 0.0034, "ZA-12": 0.0035, "ZA-27": 0.0036, "Zinc 1100": 0.0037, "Zinc 1600": 0.0038, "Zinc 3900": 0.0039
                    },
                    tungsten: {
                        "Pure Tungsten": 0.0015, "Tungsten Carbide": 0.0016, "Heavy Metal Alloys (W-Ni-Fe)": 0.0017, "Heavy Metal Alloys (W-Ni-Cu)": 0.0018, "Tungsten-Copper Alloys": 0.0019,
                        "Tungsten-Rhenium Alloys": 0.002, "Tungsten-Thorium Alloys": 0.0021, "Tungsten-Molybdenum Alloys": 0.0022
                    },
                    molybdenum: {
                        "Pure Molybdenum": 0.0015, "Molybdenum-Tungsten Alloys": 0.0016, "Molybdenum-Lanthanum Alloys": 0.0017, "TZM (Titanium-Zirconium-Molybdenum) Alloy": 0.0018, "Molybdenum-Rhenium Alloys": 0.0019
                    },
                    cobalt: {
                        "Cobalt 6B": 0.0015, "Cobalt 6K": 0.0016, "Cobalt L-605": 0.0017, "Cobalt R-41": 0.0018, "Cobalt FSX-414": 0.0019, "Cobalt HS-188": 0.002, "Cobalt MAR-M-509": 0.0021, "Cobalt MAR-M-918": 0.0022
                    },
                    gold: {
                        "24K Gold (99.9% Pure)": 0.001, "22K Gold": 0.0011, "18K Gold": 0.0012, "14K Gold": 0.0013, "10K Gold": 0.0014, "White Gold": 0.0015, "Rose Gold": 0.0016, "Green Gold": 0.0017
                    },
                    silver: {
                        "Fine Silver (99.9% Pure)": 0.001, "Sterling Silver (92.5% Silver, 7.5% Copper)": 0.0011, "Argentium Silver (93.5% or 96% Silver)": 0.0012, "Coin Silver (90% Silver, 10% Copper)": 0.0013, "Britannia Silver (95.8% Silver)": 0.0014
                    },
                    platinum: {
                        "Pt 950 (95% Platinum, 5% Other Metals)": 0.0015, "Pt 900 (90% Platinum, 10% Other Metals)": 0.0016, "Pt 850 (85% Platinum, 15% Other Metals)": 0.0017, "Iridium-Platinum Alloys": 0.0018, "Ruthenium-Platinum Alloys": 0.0019
                    },
                    palladium: {
                        "Pd 500 (50% Palladium, 50% Silver)": 0.0015, "Pd 950 (95% Palladium, 5% Other Metals)": 0.0016, "Pd 999 (99.9% Pure Palladium)": 0.0017, "Palladium-Silver Alloys": 0.0018, "Palladium-Copper Alloys": 0.0019
                    },
                    lead: {
                        "Pure Lead": 0.001, "Lead-Antimony Alloys": 0.0011, "Lead-Tin Alloys": 0.0012, "Lead-Calcium Alloys": 0.0013, "Lead-Silver Alloys": 0.0014
                    },
                    tin: {
                        "Pure Tin": 0.001, "Tin-Lead Alloys (Solder)": 0.0011, "Tin-Silver Alloys": 0.0012, "Tin-Copper Alloys (Bronze)": 0.0013, "Tin-Zinc Alloys": 0.0014
                    },
                    zirconium: {
                        "Zirconium 702 (Pure Zirconium)": 0.001, "Zirconium 704 (Zr-2.5Nb)": 0.0011, "Zirconium 705 (Zr-3Al-2.5Nb)": 0.0012, "Zircaloy-2 (Zr-Sn-Fe-Cr-Ni)": 0.0013, "Zircaloy-4 (Zr-Sn-Fe-Cr)": 0.0014
                    },
                    plastics: {
                        "Polyethylene (PE)": 0.002, "High-Density Polyethylene (HDPE)": 0.0021, "Low-Density Polyethylene (LDPE)": 0.0022, "Linear Low-Density Polyethylene (LLDPE)": 0.0023,
                        "Polypropylene (PP)": 0.0024, "Polyvinyl Chloride (PVC)": 0.0025, "Polystyrene (PS)": 0.0026, "High Impact Polystyrene (HIPS)": 0.0027, "Expanded Polystyrene (EPS)": 0.0028,
                        "Polyethylene Terephthalate (PET)": 0.0029, "Polycarbonate (PC)": 0.003, "Acrylonitrile Butadiene Styrene (ABS)": 0.0031, "Nylon (Polyamide, PA)": 0.0032,
                        "Polytetrafluoroethylene (PTFE, Teflon)": 0.0033, "Polyoxymethylene (POM, Acetal)": 0.0034, "Polyethylene Chlorinated (CPE)": 0.0035, "Polyurethane (PU)": 0.0036,
                        "Polylactic Acid (PLA)": 0.0037, "Polyethylene Naphthalate (PEN)": 0.0038, "Polybutylene Terephthalate (PBT)": 0.0039, "Polyetheretherketone (PEEK)": 0.004,
                        "Polyphenylene Oxide (PPO)": 0.0041, "Polysulfone (PSU)": 0.0042
                    },
                    glass: {
                        "Soda-Lime Glass": 0.0015, "Borosilicate Glass": 0.0016, "Lead Glass (Crystal)": 0.0017, "Aluminosilicate Glass": 0.0018, "Fused Silica Glass": 0.0019,
                        "Chemically Strengthened Glass": 0.002, "Laminated Glass": 0.0021, "Tempered Glass": 0.0022, "Glass Ceramic": 0.0023, "Optical Glass": 0.0024
                    },
                    wood: {
                        "Hardwood": 0.005, "Oak": 0.0051, "Maple": 0.0052, "Cherry": 0.0053, "Walnut": 0.0054, "Mahogany": 0.0055, "Teak": 0.0056, "Birch": 0.0057, "Ash": 0.0058, "Beech": 0.0059,
                        "Softwood": 0.006, "Pine": 0.0061, "Cedar": 0.0062, "Fir": 0.0063, "Spruce": 0.0064, "Redwood": 0.0065, "Hemlock": 0.0066,
                        "Engineered Wood": 0.0067, "Plywood": 0.0068, "Medium Density Fiberboard (MDF)": 0.0069, "Particle Board": 0.007, "Oriented Strand Board (OSB)": 0.0071, "Laminated Veneer Lumber (LVL)": 0.0072, "Cross-Laminated Timber (CLT)": 0.0073, "Glulam (Glued Laminated Timber)": 0.0074
                    }
                },
                carbideMill: {
                    aluminum: {
                        "1000 Series (Commercially Pure Aluminum)": 0.002, "1050": 0.0021, "1060": 0.0022, "1070": 0.0023, "1100": 0.0024,
                        "2000 Series (Aluminum-Copper Alloys)": 0.0025, "2011": 0.0026, "2014": 0.0027, "2017": 0.0028, "2024": 0.0029,
                        "3000 Series (Aluminum-Manganese Alloys)": 0.003, "3003": 0.0031, "3004": 0.0032, "3105": 0.0033, "3203": 0.0034,
                        "4000 Series (Aluminum-Silicon Alloys)": 0.0035, "4032": 0.0036, "4043": 0.0037, "4145": 0.0038, "4643": 0.0039,
                        "5000 Series (Aluminum-Magnesium Alloys)": 0.004, "5005": 0.0041, "5052": 0.0042, "5083": 0.0043, "5086": 0.0044, "5182": 0.0045, "5251": 0.0046, "5454": 0.0047, "5657": 0.0048,
                        "6000 Series (Aluminum-Magnesium-Silicon Alloys)": 0.005, "6005": 0.0051, "6061": 0.0052, "6063": 0.0053, "6082": 0.0054,
                        "7000 Series (Aluminum-Zinc Alloys)": 0.006, "7005": 0.0061, "7050": 0.0062, "7075": 0.0063, "7475": 0.0064,
                        "8000 Series (Other Elements)": 0.007, "8006": 0.0071, "8111": 0.0072, "8500": 0.0073, "8510": 0.0074, "8520": 0.0075
                    },
                    brass: {
                        "C21000 (Gilding Metal)": 0.003, "C22000 (Commercial Bronze)": 0.0031, "C23000 (Red Brass)": 0.0032, "C24000 (Low Brass)": 0.0033, "C26000 (Cartridge Brass)": 0.0034, "C28000 (Muntz Metal)": 0.0035, "C35300 (Leaded Brass)": 0.0036, "C36000 (Free-Cutting Brass)": 0.0037
                    },
                    bronze: {
                        "C22000 (Commercial Bronze)": 0.002, "C22600 (Red Brass)": 0.0021, "C51000 (Phosphor Bronze)": 0.0022, "C52100 (Phosphor Bronze)": 0.0023, "C54400 (Phosphor Bronze)": 0.0024, "C90300 (Tin Bronze)": 0.0025, "C90500 (Tin Bronze)": 0.0026, "C90700 (Tin Bronze)": 0.0027, "C93200 (Bearing Bronze)": 0.0028, "C95400 (Aluminum Bronze)": 0.0029, "C95900 (Aluminum Bronze)": 0.003, "C86300 (Manganese Bronze)": 0.0031
                    },
                    copper: {
                        "Pure Copper (C11000)": 0.0025, "Oxygen-Free Copper (C10100)": 0.0026, "Deoxidized High-Phosphorus Copper (C12200)": 0.0027, "Electrolytic Tough Pitch (ETP) Copper (C11000)": 0.0028, "Chromium Copper (C18200)": 0.0029, "Beryllium Copper (C17200)": 0.003, "Nickel Silver (C74500)": 0.0031, "Brass (C26000)": 0.0032, "Phosphor Bronze (C51000)": 0.0033, "Silicon Bronze (C65500)": 0.0034
                    },
                    nickel: {
                        "Nickel 200": 0.0015, "Nickel 201": 0.0015, "Nickel 205": 0.0015, "Nickel 270": 0.0016, "Nickel 400 (Monel 400)": 0.0016, "Nickel 404": 0.0016, "Nickel 600 (Inconel 600)": 0.0017, "Nickel 625 (Inconel 625)": 0.0017, "Nickel 718 (Inconel 718)": 0.0018, "Nickel K500 (Monel K500)": 0.0018, "Nickel 800 (Incoloy 800)": 0.0019, "Nickel 825 (Incoloy 825)": 0.0019
                    },
                    carbonSteel: {
                        "Low Carbon Steel": 0.0025, "1008 Steel": 0.0026, "1010 Steel": 0.0027, "1018 Steel": 0.0028, "1020 Steel": 0.0029,
                        "Medium Carbon Steel": 0.003, "1040 Steel": 0.0031, "1045 Steel": 0.0032, "1050 Steel": 0.0033, "1060 Steel": 0.0034,
                        "High Carbon Steel": 0.0035, "1070 Steel": 0.0036, "1080 Steel": 0.0037, "1090 Steel": 0.0038, "1095 Steel": 0.0039,
                        "Ultra-High Carbon Steel": 0.004, "1100 Steel": 0.0041, "1150 Steel": 0.0042, "1200 Steel": 0.0043
                    },
                    alloySteel: {
                        "4140 Alloy Steel": 0.0025, "4340 Alloy Steel": 0.0026, "4130 Alloy Steel": 0.0027, "8620 Alloy Steel": 0.0028, "9310 Alloy Steel": 0.0029,
                        "6150 Alloy Steel": 0.003, "4340V Alloy Steel": 0.0031, "52100 Alloy Steel": 0.0032, "300M Alloy Steel": 0.0033, "Maraging Steel (18Ni-300)": 0.0034, "Maraging Steel (18Ni-250)": 0.0035, "AISI 4145 Alloy Steel": 0.0036
                    },
                    stainlessSteel: {
                        "Austenitic Stainless Steel": 0.0025, "Ferritic Stainless Steel": 0.0026, "Martensitic Stainless Steel": 0.0027, "Duplex Stainless Steel": 0.0028, "Precipitation-Hardening Stainless Steel": 0.0029
                    },
                    toolSteel: {
                        "A2 Steel": 0.0015, "D2 Steel": 0.0016, "O1 Steel": 0.0017, "M2 Steel": 0.0018, "S7 Steel": 0.0019, "H13 Steel": 0.002, "W1 Steel": 0.0021
                    },
                    inconel: {
                        "Inconel 600": 0.0015, "Inconel 601": 0.0016, "Inconel 617": 0.0017, "Inconel 625": 0.0018, "Inconel 686": 0.0019,
                        "Inconel 690": 0.002, "Inconel 693": 0.0021, "Inconel 718": 0.0022, "Inconel 725": 0.0023, "Inconel 750": 0.0024, "Inconel 751": 0.0025, "Inconel 792": 0.0026, "Inconel X-750": 0.0027, "Inconel HX": 0.0028, "Inconel 939": 0.0029
                    },
                    titanium: {
                        "Grade 1 (Pure Titanium)": 0.0015, "Grade 2 (Commercially Pure Titanium)": 0.0016, "Grade 3 (Commercially Pure Titanium)": 0.0017, "Grade 4 (Commercially Pure Titanium)": 0.0018, "Grade 5 (Ti-6Al-4V)": 0.0019,
                        "Grade 6 (Al-4V-2Sn)": 0.002, "Grade 7 (Ti-0.2Pd)": 0.0021, "Grade 9 (Ti-3Al-2.5V)": 0.0022, "Grade 12 (Ti-0.3Mo-0.8Ni)": 0.0023, "Grade 23 (Ti-6Al-4V ELI)": 0.0024
                    },
                    magnesium: {
                        "AZ31B": 0.002, "AZ61A": 0.0021, "AZ80A": 0.0022, "ZK60A": 0.0023, "WE43": 0.0024, "Elektron 21": 0.0025, "Magnesium ZM21": 0.0026
                    },
                    zinc: {
                        "Zamak 2": 0.003, "Zamak 3": 0.0031, "Zamak 5": 0.0032, "Zamak 7": 0.0033, "ZA-8": 0.0034, "ZA-12": 0.0035, "ZA-27": 0.0036, "Zinc 1100": 0.0037, "Zinc 1600": 0.0038, "Zinc 3900": 0.0039
                    },
                    tungsten: {
                        "Pure Tungsten": 0.0015, "Tungsten Carbide": 0.0016, "Heavy Metal Alloys (W-Ni-Fe)": 0.0017, "Heavy Metal Alloys (W-Ni-Cu)": 0.0018, "Tungsten-Copper Alloys": 0.0019,
                        "Tungsten-Rhenium Alloys": 0.002, "Tungsten-Thorium Alloys": 0.0021, "Tungsten-Molybdenum Alloys": 0.0022
                    },
                    molybdenum: {
                        "Pure Molybdenum": 0.0015, "Molybdenum-Tungsten Alloys": 0.0016, "Molybdenum-Lanthanum Alloys": 0.0017, "TZM (Titanium-Zirconium-Molybdenum) Alloy": 0.0018, "Molybdenum-Rhenium Alloys": 0.0019
                    },
                    cobalt: {
                        "Cobalt 6B": 0.0015, "Cobalt 6K": 0.0016, "Cobalt L-605": 0.0017, "Cobalt R-41": 0.0018, "Cobalt FSX-414": 0.0019, "Cobalt HS-188": 0.002, "Cobalt MAR-M-509": 0.0021, "Cobalt MAR-M-918": 0.0022
                    },
                    gold: {
                        "24K Gold (99.9% Pure)": 0.001, "22K Gold": 0.0011, "18K Gold": 0.0012, "14K Gold": 0.0013, "10K Gold": 0.0014, "White Gold": 0.0015, "Rose Gold": 0.0016, "Green Gold": 0.0017
                    },
                    silver: {
                        "Fine Silver (99.9% Pure)": 0.001, "Sterling Silver (92.5% Silver, 7.5% Copper)": 0.0011, "Argentium Silver (93.5% or 96% Silver)": 0.0012, "Coin Silver (90% Silver, 10% Copper)": 0.0013, "Britannia Silver (95.8% Silver)": 0.0014
                    },
                    platinum: {
                        "Pt 950 (95% Platinum, 5% Other Metals)": 0.0015, "Pt 900 (90% Platinum, 10% Other Metals)": 0.0016, "Pt 850 (85% Platinum, 15% Other Metals)": 0.0017, "Iridium-Platinum Alloys": 0.0018, "Ruthenium-Platinum Alloys": 0.0019
                    },
                    palladium: {
                        "Pd 500 (50% Palladium, 50% Silver)": 0.0015, "Pd 950 (95% Palladium, 5% Other Metals)": 0.0016, "Pd 999 (99.9% Pure Palladium)": 0.0017, "Palladium-Silver Alloys": 0.0018, "Palladium-Copper Alloys": 0.0019
                    },
                    lead: {
                        "Pure Lead": 0.001, "Lead-Antimony Alloys": 0.0011, "Lead-Tin Alloys": 0.0012, "Lead-Calcium Alloys": 0.0013, "Lead-Silver Alloys": 0.0014
                    },
                    tin: {
                        "Pure Tin": 0.001, "Tin-Lead Alloys (Solder)": 0.0011, "Tin-Silver Alloys": 0.0012, "Tin-Copper Alloys (Bronze)": 0.0013, "Tin-Zinc Alloys": 0.0014
                    },
                    zirconium: {
                        "Zirconium 702 (Pure Zirconium)": 0.001, "Zirconium 704 (Zr-2.5Nb)": 0.0011, "Zirconium 705 (Zr-3Al-2.5Nb)": 0.0012, "Zircaloy-2 (Zr-Sn-Fe-Cr-Ni)": 0.0013, "Zircaloy-4 (Zr-Sn-Fe-Cr)": 0.0014
                    },
                    plastics: {
                        "Polyethylene (PE)": 0.002, "High-Density Polyethylene (HDPE)": 0.0021, "Low-Density Polyethylene (LDPE)": 0.0022, "Linear Low-Density Polyethylene (LLDPE)": 0.0023,
                        "Polypropylene (PP)": 0.0024, "Polyvinyl Chloride (PVC)": 0.0025, "Polystyrene (PS)": 0.0026, "High Impact Polystyrene (HIPS)": 0.0027, "Expanded Polystyrene (EPS)": 0.0028,
                        "Polyethylene Terephthalate (PET)": 0.0029, "Polycarbonate (PC)": 0.003, "Acrylonitrile Butadiene Styrene (ABS)": 0.0031, "Nylon (Polyamide, PA)": 0.0032,
                        "Polytetrafluoroethylene (PTFE, Teflon)": 0.0033, "Polyoxymethylene (POM, Acetal)": 0.0034, "Polyethylene Chlorinated (CPE)": 0.0035, "Polyurethane (PU)": 0.0036,
                        "Polylactic Acid (PLA)": 0.0037, "Polyethylene Naphthalate (PEN)": 0.0038, "Polybutylene Terephthalate (PBT)": 0.0039, "Polyetheretherketone (PEEK)": 0.004,
                        "Polyphenylene Oxide (PPO)": 0.0041, "Polysulfone (PSU)": 0.0042
                    },
                    glass: {
                        "Soda-Lime Glass": 0.0015, "Borosilicate Glass": 0.0016, "Lead Glass (Crystal)": 0.0017, "Aluminosilicate Glass": 0.0018, "Fused Silica Glass": 0.0019,
                        "Chemically Strengthened Glass": 0.002, "Laminated Glass": 0.0021, "Tempered Glass": 0.0022, "Glass Ceramic": 0.0023, "Optical Glass": 0.0024
                    },
                    wood: {
                        "Hardwood": 0.005, "Oak": 0.0051, "Maple": 0.0052, "Cherry": 0.0053, "Walnut": 0.0054, "Mahogany": 0.0055, "Teak": 0.0056, "Birch": 0.0057, "Ash": 0.0058, "Beech": 0.0059,
                        "Softwood": 0.006, "Pine": 0.0061, "Cedar": 0.0062, "Fir": 0.0063, "Spruce": 0.0064, "Redwood": 0.0065, "Hemlock": 0.0066,
                        "Engineered Wood": 0.0067, "Plywood": 0.0068, "Medium Density Fiberboard (MDF)": 0.0069, "Particle Board": 0.007, "Oriented Strand Board (OSB)": 0.0071, "Laminated Veneer Lumber (LVL)": 0.0072, "Cross-Laminated Timber (CLT)": 0.0073, "Glulam (Glued Laminated Timber)": 0.0074
                    }
                },
                reamer: {
                    aluminum: {
                        "1000 Series (Commercially Pure Aluminum)": 0.002, "1050": 0.0021, "1060": 0.0022, "1070": 0.0023, "1100": 0.0024,
                        "2000 Series (Aluminum-Copper Alloys)": 0.0025, "2011": 0.0026, "2014": 0.0027, "2017": 0.0028, "2024": 0.0029,
                        "3000 Series (Aluminum-Manganese Alloys)": 0.003, "3003": 0.0031, "3004": 0.0032, "3105": 0.0033, "3203": 0.0034,
                        "4000 Series (Aluminum-Silicon Alloys)": 0.0035, "4032": 0.0036, "4043": 0.0037, "4145": 0.0038, "4643": 0.0039,
                        "5000 Series (Aluminum-Magnesium Alloys)": 0.004, "5005": 0.0041, "5052": 0.0042, "5083": 0.0043, "5086": 0.0044, "5182": 0.0045, "5251": 0.0046, "5454": 0.0047, "5657": 0.0048,
                        "6000 Series (Aluminum-Magnesium-Silicon Alloys)": 0.005, "6005": 0.0051, "6061": 0.0052, "6063": 0.0053, "6082": 0.0054,
                        "7000 Series (Aluminum-Zinc Alloys)": 0.006, "7005": 0.0061, "7050": 0.0062, "7075": 0.0063, "7475": 0.0064,
                        "8000 Series (Other Elements)": 0.007, "8006": 0.0071, "8111": 0.0072, "8500": 0.0073, "8510": 0.0074, "8520": 0.0075
                    },
                    brass: {
                        "C21000 (Gilding Metal)": 0.003, "C22000 (Commercial Bronze)": 0.0031, "C23000 (Red Brass)": 0.0032, "C24000 (Low Brass)": 0.0033, "C26000 (Cartridge Brass)": 0.0034, "C28000 (Muntz Metal)": 0.0035, "C35300 (Leaded Brass)": 0.0036, "C36000 (Free-Cutting Brass)": 0.0037
                    },
                    bronze: {
                        "C22000 (Commercial Bronze)": 0.002, "C22600 (Red Brass)": 0.0021, "C51000 (Phosphor Bronze)": 0.0022, "C52100 (Phosphor Bronze)": 0.0023, "C54400 (Phosphor Bronze)": 0.0024, "C90300 (Tin Bronze)": 0.0025, "C90500 (Tin Bronze)": 0.0026, "C90700 (Tin Bronze)": 0.0027, "C93200 (Bearing Bronze)": 0.0028, "C95400 (Aluminum Bronze)": 0.0029, "C95900 (Aluminum Bronze)": 0.003, "C86300 (Manganese Bronze)": 0.0031
                    },
                    copper: {
                        "Pure Copper (C11000)": 0.0025, "Oxygen-Free Copper (C10100)": 0.0026, "Deoxidized High-Phosphorus Copper (C12200)": 0.0027, "Electrolytic Tough Pitch (ETP) Copper (C11000)": 0.0028, "Chromium Copper (C18200)": 0.0029, "Beryllium Copper (C17200)": 0.003, "Nickel Silver (C74500)": 0.0031, "Brass (C26000)": 0.0032, "Phosphor Bronze (C51000)": 0.0033, "Silicon Bronze (C65500)": 0.0034
                    },
                    nickel: {
                        "Nickel 200": 0.0015, "Nickel 201": 0.0015, "Nickel 205": 0.0015, "Nickel 270": 0.0016, "Nickel 400 (Monel 400)": 0.0016, "Nickel 404": 0.0016, "Nickel 600 (Inconel 600)": 0.0017, "Nickel 625 (Inconel 625)": 0.0017, "Nickel 718 (Inconel 718)": 0.0018, "Nickel K500 (Monel K500)": 0.0018, "Nickel 800 (Incoloy 800)": 0.0019, "Nickel 825 (Incoloy 825)": 0.0019
                    },
                    carbonSteel: {
                        "Low Carbon Steel": 0.0025, "1008 Steel": 0.0026, "1010 Steel": 0.0027, "1018 Steel": 0.0028, "1020 Steel": 0.0029,
                        "Medium Carbon Steel": 0.003, "1040 Steel": 0.0031, "1045 Steel": 0.0032, "1050 Steel": 0.0033, "1060 Steel": 0.0034,
                        "High Carbon Steel": 0.0035, "1070 Steel": 0.0036, "1080 Steel": 0.0037, "1090 Steel": 0.0038, "1095 Steel": 0.0039,
                        "Ultra-High Carbon Steel": 0.004, "1100 Steel": 0.0041, "1150 Steel": 0.0042, "1200 Steel": 0.0043
                    },
                    alloySteel: {
                        "4140 Alloy Steel": 0.0025, "4340 Alloy Steel": 0.0026, "4130 Alloy Steel": 0.0027, "8620 Alloy Steel": 0.0028, "9310 Alloy Steel": 0.0029,
                        "6150 Alloy Steel": 0.003, "4340V Alloy Steel": 0.0031, "52100 Alloy Steel": 0.0032, "300M Alloy Steel": 0.0033, "Maraging Steel (18Ni-300)": 0.0034, "Maraging Steel (18Ni-250)": 0.0035, "AISI 4145 Alloy Steel": 0.0036
                    },
                    stainlessSteel: {
                        "Austenitic Stainless Steel": 0.0025, "Ferritic Stainless Steel": 0.0026, "Martensitic Stainless Steel": 0.0027, "Duplex Stainless Steel": 0.0028, "Precipitation-Hardening Stainless Steel": 0.0029
                    },
                    toolSteel: {
                        "A2 Steel": 0.0015, "D2 Steel": 0.0016, "O1 Steel": 0.0017, "M2 Steel": 0.0018, "S7 Steel": 0.0019, "H13 Steel": 0.002, "W1 Steel": 0.0021
                    },
                    inconel: {
                        "Inconel 600": 0.0015, "Inconel 601": 0.0016, "Inconel 617": 0.0017, "Inconel 625": 0.0018, "Inconel 686": 0.0019,
                        "Inconel 690": 0.002, "Inconel 693": 0.0021, "Inconel 718": 0.0022, "Inconel 725": 0.0023, "Inconel 750": 0.0024, "Inconel 751": 0.0025, "Inconel 792": 0.0026, "Inconel X-750": 0.0027, "Inconel HX": 0.0028, "Inconel 939": 0.0029
                    },
                    titanium: {
                        "Grade 1 (Pure Titanium)": 0.0015, "Grade 2 (Commercially Pure Titanium)": 0.0016, "Grade 3 (Commercially Pure Titanium)": 0.0017, "Grade 4 (Commercially Pure Titanium)": 0.0018, "Grade 5 (Ti-6Al-4V)": 0.0019,
                        "Grade 6 (Al-4V-2Sn)": 0.002, "Grade 7 (Ti-0.2Pd)": 0.0021, "Grade 9 (Ti-3Al-2.5V)": 0.0022, "Grade 12 (Ti-0.3Mo-0.8Ni)": 0.0023, "Grade 23 (Ti-6Al-4V ELI)": 0.0024
                    },
                    magnesium: {
                        "AZ31B": 0.002, "AZ61A": 0.0021, "AZ80A": 0.0022, "ZK60A": 0.0023, "WE43": 0.0024, "Elektron 21": 0.0025, "Magnesium ZM21": 0.0026
                    },
                    zinc: {
                        "Zamak 2": 0.003, "Zamak 3": 0.0031, "Zamak 5": 0.0032, "Zamak 7": 0.0033, "ZA-8": 0.0034, "ZA-12": 0.0035, "ZA-27": 0.0036, "Zinc 1100": 0.0037, "Zinc 1600": 0.0038, "Zinc 3900": 0.0039
                    },
                    tungsten: {
                        "Pure Tungsten": 0.0015, "Tungsten Carbide": 0.0016, "Heavy Metal Alloys (W-Ni-Fe)": 0.0017, "Heavy Metal Alloys (W-Ni-Cu)": 0.0018, "Tungsten-Copper Alloys": 0.0019,
                        "Tungsten-Rhenium Alloys": 0.002, "Tungsten-Thorium Alloys": 0.0021, "Tungsten-Molybdenum Alloys": 0.0022
                    },
                    molybdenum: {
                        "Pure Molybdenum": 0.0015, "Molybdenum-Tungsten Alloys": 0.0016, "Molybdenum-Lanthanum Alloys": 0.0017, "TZM (Titanium-Zirconium-Molybdenum) Alloy": 0.0018, "Molybdenum-Rhenium Alloys": 0.0019
                    },
                    cobalt: {
                        "Cobalt 6B": 0.0015, "Cobalt 6K": 0.0016, "Cobalt L-605": 0.0017, "Cobalt R-41": 0.0018, "Cobalt FSX-414": 0.0019, "Cobalt HS-188": 0.002, "Cobalt MAR-M-509": 0.0021, "Cobalt MAR-M-918": 0.0022
                    },
                    gold: {
                        "24K Gold (99.9% Pure)": 0.001, "22K Gold": 0.0011, "18K Gold": 0.0012, "14K Gold": 0.0013, "10K Gold": 0.0014, "White Gold": 0.0015, "Rose Gold": 0.0016, "Green Gold": 0.0017
                    },
                    silver: {
                        "Fine Silver (99.9% Pure)": 0.001, "Sterling Silver (92.5% Silver, 7.5% Copper)": 0.0011, "Argentium Silver (93.5% or 96% Silver)": 0.0012, "Coin Silver (90% Silver, 10% Copper)": 0.0013, "Britannia Silver (95.8% Silver)": 0.0014
                    },
                    platinum: {
                        "Pt 950 (95% Platinum, 5% Other Metals)": 0.0015, "Pt 900 (90% Platinum, 10% Other Metals)": 0.0016, "Pt 850 (85% Platinum, 15% Other Metals)": 0.0017, "Iridium-Platinum Alloys": 0.0018, "Ruthenium-Platinum Alloys": 0.0019
                    },
                    palladium: {
                        "Pd 500 (50% Palladium, 50% Silver)": 0.0015, "Pd 950 (95% Palladium, 5% Other Metals)": 0.0016, "Pd 999 (99.9% Pure Palladium)": 0.0017, "Palladium-Silver Alloys": 0.0018, "Palladium-Copper Alloys": 0.0019
                    },
                    lead: {
                        "Pure Lead": 0.001, "Lead-Antimony Alloys": 0.0011, "Lead-Tin Alloys": 0.0012, "Lead-Calcium Alloys": 0.0013, "Lead-Silver Alloys": 0.0014
                    },
                    tin: {
                        "Pure Tin": 0.001, "Tin-Lead Alloys (Solder)": 0.0011, "Tin-Silver Alloys": 0.0012, "Tin-Copper Alloys (Bronze)": 0.0013, "Tin-Zinc Alloys": 0.0014
                    },
                    zirconium: {
                        "Zirconium 702 (Pure Zirconium)": 0.001, "Zirconium 704 (Zr-2.5Nb)": 0.0011, "Zirconium 705 (Zr-3Al-2.5Nb)": 0.0012, "Zircaloy-2 (Zr-Sn-Fe-Cr-Ni)": 0.0013, "Zircaloy-4 (Zr-Sn-Fe-Cr)": 0.0014
                    },
                    plastics: {
                        "Polyethylene (PE)": 0.002, "High-Density Polyethylene (HDPE)": 0.0021, "Low-Density Polyethylene (LDPE)": 0.0022, "Linear Low-Density Polyethylene (LLDPE)": 0.0023,
                        "Polypropylene (PP)": 0.0024, "Polyvinyl Chloride (PVC)": 0.0025, "Polystyrene (PS)": 0.0026, "High Impact Polystyrene (HIPS)": 0.0027, "Expanded Polystyrene (EPS)": 0.0028,
                        "Polyethylene Terephthalate (PET)": 0.0029, "Polycarbonate (PC)": 0.003, "Acrylonitrile Butadiene Styrene (ABS)": 0.0031, "Nylon (Polyamide, PA)": 0.0032,
                        "Polytetrafluoroethylene (PTFE, Teflon)": 0.0033, "Polyoxymethylene (POM, Acetal)": 0.0034, "Polyethylene Chlorinated (CPE)": 0.0035, "Polyurethane (PU)": 0.0036,
                        "Polylactic Acid (PLA)": 0.0037, "Polyethylene Naphthalate (PEN)": 0.0038, "Polybutylene Terephthalate (PBT)": 0.0039, "Polyetheretherketone (PEEK)": 0.004,
                        "Polyphenylene Oxide (PPO)": 0.0041, "Polysulfone (PSU)": 0.0042
                    },
                    glass: {
                        "Soda-Lime Glass": 0.0015, "Borosilicate Glass": 0.0016, "Lead Glass (Crystal)": 0.0017, "Aluminosilicate Glass": 0.0018, "Fused Silica Glass": 0.0019,
                        "Chemically Strengthened Glass": 0.002, "Laminated Glass": 0.0021, "Tempered Glass": 0.0022, "Glass Ceramic": 0.0023, "Optical Glass": 0.0024
                    },
                    wood: {
                        "Hardwood": 0.005, "Oak": 0.0051, "Maple": 0.0052, "Cherry": 0.0053, "Walnut": 0.0054, "Mahogany": 0.0055, "Teak": 0.0056, "Birch": 0.0057, "Ash": 0.0058, "Beech": 0.0059,
                        "Softwood": 0.006, "Pine": 0.0061, "Cedar": 0.0062, "Fir": 0.0063, "Spruce": 0.0064, "Redwood": 0.0065, "Hemlock": 0.0066,
                        "Engineered Wood": 0.0067, "Plywood": 0.0068, "Medium Density Fiberboard (MDF)": 0.0069, "Particle Board": 0.007, "Oriented Strand Board (OSB)": 0.0071, "Laminated Veneer Lumber (LVL)": 0.0072, "Cross-Laminated Timber (CLT)": 0.0073, "Glulam (Glued Laminated Timber)": 0.0074
                    }
                },
                coldFormTap: {
                    aluminum: {
                        "1000 Series (Commercially Pure Aluminum)": 0.0015, "1050": 0.0016, "1060": 0.0017, "1070": 0.0018, "1100": 0.0019,
                        "2000 Series (Aluminum-Copper Alloys)": 0.002, "2011": 0.0021, "2014": 0.0022, "2017": 0.0023, "2024": 0.0024,
                        "3000 Series (Aluminum-Manganese Alloys)": 0.0025, "3003": 0.0026, "3004": 0.0027, "3105": 0.0028, "3203": 0.0029,
                        "4000 Series (Aluminum-Silicon Alloys)": 0.003, "4032": 0.0031, "4043": 0.0032, "4145": 0.0033, "4643": 0.0034,
                        "5000 Series (Aluminum-Magnesium Alloys)": 0.0035, "5005": 0.0036, "5052": 0.0037, "5083": 0.0038, "5086": 0.0039, "5182": 0.004, "5251": 0.0041, "5454": 0.0042, "5657": 0.0043,
                        "6000 Series (Aluminum-Magnesium-Silicon Alloys)": 0.0044, "6005": 0.0045, "6061": 0.0046, "6063": 0.0047, "6082": 0.0048,
                        "7000 Series (Aluminum-Zinc Alloys)": 0.0049, "7005": 0.005, "7050": 0.0051, "7075": 0.0052, "7475": 0.0053,
                        "8000 Series (Other Elements)": 0.0054, "8006": 0.0055, "8111": 0.0056, "8500": 0.0057, "8510": 0.0058, "8520": 0.0059
                    },
                    brass: {
                        "C21000 (Gilding Metal)": 0.0025, "C22000 (Commercial Bronze)": 0.0026, "C23000 (Red Brass)": 0.0027, "C24000 (Low Brass)": 0.0028, "C26000 (Cartridge Brass)": 0.0029, "C28000 (Muntz Metal)": 0.003, "C35300 (Leaded Brass)": 0.0031, "C36000 (Free-Cutting Brass)": 0.0032
                    },
                    bronze: {
                        "C22000 (Commercial Bronze)": 0.002, "C22600 (Red Brass)": 0.0021, "C51000 (Phosphor Bronze)": 0.0022, "C52100 (Phosphor Bronze)": 0.0023, "C54400 (Phosphor Bronze)": 0.0024, "C90300 (Tin Bronze)": 0.0025, "C90500 (Tin Bronze)": 0.0026, "C90700 (Tin Bronze)": 0.0027, "C93200 (Bearing Bronze)": 0.0028, "C95400 (Aluminum Bronze)": 0.0029, "C95900 (Aluminum Bronze)": 0.003, "C86300 (Manganese Bronze)": 0.0031
                    },
                    copper: {
                        "Pure Copper (C11000)": 0.0025, "Oxygen-Free Copper (C10100)": 0.0026, "Deoxidized High-Phosphorus Copper (C12200)": 0.0027, "Electrolytic Tough Pitch (ETP) Copper (C11000)": 0.0028, "Chromium Copper (C18200)": 0.0029, "Beryllium Copper (C17200)": 0.003, "Nickel Silver (C74500)": 0.0031, "Brass (C26000)": 0.0032, "Phosphor Bronze (C51000)": 0.0033, "Silicon Bronze (C65500)": 0.0034
                    },
                    nickel: {
                        "Nickel 200": 0.001, "Nickel 201": 0.001, "Nickel 205": 0.001, "Nickel 270": 0.0011, "Nickel 400 (Monel 400)": 0.0011, "Nickel 404": 0.0011, "Nickel 600 (Inconel 600)": 0.0012, "Nickel 625 (Inconel 625)": 0.0012, "Nickel 718 (Inconel 718)": 0.0013, "Nickel K500 (Monel K500)": 0.0013, "Nickel 800 (Incoloy 800)": 0.0014, "Nickel 825 (Incoloy 825)": 0.0014
                    },
                    carbonSteel: {
                        "Low Carbon Steel": 0.0015, "1008 Steel": 0.0016, "1010 Steel": 0.0017, "1018 Steel": 0.0018, "1020 Steel": 0.0019,
                        "Medium Carbon Steel": 0.002, "1040 Steel": 0.0021, "1045 Steel": 0.0022, "1050 Steel": 0.0023, "1060 Steel": 0.0024,
                        "High Carbon Steel": 0.0025, "1070 Steel": 0.0026, "1080 Steel": 0.0027, "1090 Steel": 0.0028, "1095 Steel": 0.0029,
                        "Ultra-High Carbon Steel": 0.003, "1100 Steel": 0.0031, "1150 Steel": 0.0032, "1200 Steel": 0.0033
                    },
                    alloySteel: {
                        "4140 Alloy Steel": 0.0025, "4340 Alloy Steel": 0.0026, "4130 Alloy Steel": 0.0027, "8620 Alloy Steel": 0.0028, "9310 Alloy Steel": 0.0029,
                        "6150 Alloy Steel": 0.003, "4340V Alloy Steel": 0.0031, "52100 Alloy Steel": 0.0032, "300M Alloy Steel": 0.0033, "Maraging Steel (18Ni-300)": 0.0034, "Maraging Steel (18Ni-250)": 0.0035, "AISI 4145 Alloy Steel": 0.0036
                    },
                    stainlessSteel: {
                        "Austenitic Stainless Steel": 0.0025, "Ferritic Stainless Steel": 0.0026, "Martensitic Stainless Steel": 0.0027, "Duplex Stainless Steel": 0.0028, "Precipitation-Hardening Stainless Steel": 0.0029
                    },
                    toolSteel: {
                        "A2 Steel": 0.0015, "D2 Steel": 0.0016, "O1 Steel": 0.0017, "M2 Steel": 0.0018, "S7 Steel": 0.0019, "H13 Steel": 0.002, "W1 Steel": 0.0021
                    },
                    inconel: {
                        "Inconel 600": 0.0015, "Inconel 601": 0.0016, "Inconel 617": 0.0017, "Inconel 625": 0.0018, "Inconel 686": 0.0019,
                        "Inconel 690": 0.002, "Inconel 693": 0.0021, "Inconel 718": 0.0022, "Inconel 725": 0.0023, "Inconel 750": 0.0024, "Inconel 751": 0.0025, "Inconel 792": 0.0026, "Inconel X-750": 0.0027, "Inconel HX": 0.0028, "Inconel 939": 0.0029
                    },
                    titanium: {
                        "Grade 1 (Pure Titanium)": 0.0015, "Grade 2 (Commercially Pure Titanium)": 0.0016, "Grade 3 (Commercially Pure Titanium)": 0.0017, "Grade 4 (Commercially Pure Titanium)": 0.0018, "Grade 5 (Ti-6Al-4V)": 0.0019,
                        "Grade 6 (Al-4V-2Sn)": 0.002, "Grade 7 (Ti-0.2Pd)": 0.0021, "Grade 9 (Ti-3Al-2.5V)": 0.0022, "Grade 12 (Ti-0.3Mo-0.8Ni)": 0.0023, "Grade 23 (Ti-6Al-4V ELI)": 0.0024
                    },
                    magnesium: {
                        "AZ31B": 0.002, "AZ61A": 0.0021, "AZ80A": 0.0022, "ZK60A": 0.0023, "WE43": 0.0024, "Elektron 21": 0.0025, "Magnesium ZM21": 0.0026
                    },
                    zinc: {
                        "Zamak 2": 0.003, "Zamak 3": 0.0031, "Zamak 5": 0.0032, "Zamak 7": 0.0033, "ZA-8": 0.0034, "ZA-12": 0.0035, "ZA-27": 0.0036, "Zinc 1100": 0.0037, "Zinc 1600": 0.0038, "Zinc 3900": 0.0039
                    },
                    tungsten: {
                        "Pure Tungsten": 0.0015, "Tungsten Carbide": 0.0016, "Heavy Metal Alloys (W-Ni-Fe)": 0.0017, "Heavy Metal Alloys (W-Ni-Cu)": 0.0018, "Tungsten-Copper Alloys": 0.0019,
                        "Tungsten-Rhenium Alloys": 0.002, "Tungsten-Thorium Alloys": 0.0021, "Tungsten-Molybdenum Alloys": 0.0022
                    },
                    molybdenum: {
                        "Pure Molybdenum": 0.0015, "Molybdenum-Tungsten Alloys": 0.0016, "Molybdenum-Lanthanum Alloys": 0.0017, "TZM (Titanium-Zirconium-Molybdenum) Alloy": 0.0018, "Molybdenum-Rhenium Alloys": 0.0019
                    },
                    cobalt: {
                        "Cobalt 6B": 0.0015, "Cobalt 6K": 0.0016, "Cobalt L-605": 0.0017, "Cobalt R-41": 0.0018, "Cobalt FSX-414": 0.0019, "Cobalt HS-188": 0.002, "Cobalt MAR-M-509": 0.0021, "Cobalt MAR-M-918": 0.0022
                    },
                    gold: {
                        "24K Gold (99.9% Pure)": 0.001, "22K Gold": 0.0011, "18K Gold": 0.0012, "14K Gold": 0.0013, "10K Gold": 0.0014, "White Gold": 0.0015, "Rose Gold": 0.0016, "Green Gold": 0.0017
                    },
                    silver: {
                        "Fine Silver (99.9% Pure)": 0.001, "Sterling Silver (92.5% Silver, 7.5% Copper)": 0.0011, "Argentium Silver (93.5% or 96% Silver)": 0.0012, "Coin Silver (90% Silver, 10% Copper)": 0.0013, "Britannia Silver (95.8% Silver)": 0.0014
                    },
                    platinum: {
                        "Pt 950 (95% Platinum, 5% Other Metals)": 0.0015, "Pt 900 (90% Platinum, 10% Other Metals)": 0.0016, "Pt 850 (85% Platinum, 15% Other Metals)": 0.0017, "Iridium-Platinum Alloys": 0.0018, "Ruthenium-Platinum Alloys": 0.0019
                    },
                    palladium: {
                        "Pd 500 (50% Palladium, 50% Silver)": 0.0015, "Pd 950 (95% Palladium, 5% Other Metals)": 0.0016, "Pd 999 (99.9% Pure Palladium)": 0.0017, "Palladium-Silver Alloys": 0.0018, "Palladium-Copper Alloys": 0.0019
                    },
                    lead: {
                        "Pure Lead": 0.001, "Lead-Antimony Alloys": 0.0011, "Lead-Tin Alloys": 0.0012, "Lead-Calcium Alloys": 0.0013, "Lead-Silver Alloys": 0.0014
                    },
                    tin: {
                        "Pure Tin": 0.001, "Tin-Lead Alloys (Solder)": 0.0011, "Tin-Silver Alloys": 0.0012, "Tin-Copper Alloys (Bronze)": 0.0013, "Tin-Zinc Alloys": 0.0014
                    },
                    zirconium: {
                        "Zirconium 702 (Pure Zirconium)": 0.001, "Zirconium 704 (Zr-2.5Nb)": 0.0011, "Zirconium 705 (Zr-3Al-2.5Nb)": 0.0012, "Zircaloy-2 (Zr-Sn-Fe-Cr-Ni)": 0.0013, "Zircaloy-4 (Zr-Sn-Fe-Cr)": 0.0014
                    },
                    plastics: {
                        "Polyethylene (PE)": 0.002, "High-Density Polyethylene (HDPE)": 0.0021, "Low-Density Polyethylene (LDPE)": 0.0022, "Linear Low-Density Polyethylene (LLDPE)": 0.0023,
                        "Polypropylene (PP)": 0.0024, "Polyvinyl Chloride (PVC)": 0.0025, "Polystyrene (PS)": 0.0026, "High Impact Polystyrene (HIPS)": 0.0027, "Expanded Polystyrene (EPS)": 0.0028,
                        "Polyethylene Terephthalate (PET)": 0.0029, "Polycarbonate (PC)": 0.003, "Acrylonitrile Butadiene Styrene (ABS)": 0.0031, "Nylon (Polyamide, PA)": 0.0032,
                        "Polytetrafluoroethylene (PTFE, Teflon)": 0.0033, "Polyoxymethylene (POM, Acetal)": 0.0034, "Polyethylene Chlorinated (CPE)": 0.0035, "Polyurethane (PU)": 0.0036,
                        "Polylactic Acid (PLA)": 0.0037, "Polyethylene Naphthalate (PEN)": 0.0038, "Polybutylene Terephthalate (PBT)": 0.0039, "Polyetheretherketone (PEEK)": 0.004,
                        "Polyphenylene Oxide (PPO)": 0.0041, "Polysulfone (PSU)": 0.0042
                    },
                    glass: {
                        "Soda-Lime Glass": 0.0015, "Borosilicate Glass": 0.0016, "Lead Glass (Crystal)": 0.0017, "Aluminosilicate Glass": 0.0018, "Fused Silica Glass": 0.0019,
                        "Chemically Strengthened Glass": 0.002, "Laminated Glass": 0.0021, "Tempered Glass": 0.0022, "Glass Ceramic": 0.0023, "Optical Glass": 0.0024
                    },
                    wood: {
                        "Hardwood": 0.005, "Oak": 0.0051, "Maple": 0.0052, "Cherry": 0.0053, "Walnut": 0.0054, "Mahogany": 0.0055, "Teak": 0.0056, "Birch": 0.0057, "Ash": 0.0058, "Beech": 0.0059,
                        "Softwood": 0.006, "Pine": 0.0061, "Cedar": 0.0062, "Fir": 0.0063, "Spruce": 0.0064, "Redwood": 0.0065, "Hemlock": 0.0066,
                        "Engineered Wood": 0.0067, "Plywood": 0.0068, "Medium Density Fiberboard (MDF)": 0.0069, "Particle Board": 0.007, "Oriented Strand Board (OSB)": 0.0071, "Laminated Veneer Lumber (LVL)": 0.0072, "Cross-Laminated Timber (CLT)": 0.0073, "Glulam (Glued Laminated Timber)": 0.0074
                    }
                },
                spiralLockTaps: {
                    aluminum: {
                        "1000 Series (Commercially Pure Aluminum)": 0.002, "1050": 0.0021, "1060": 0.0022, "1070": 0.0023, "1100": 0.0024,
                        "2000 Series (Aluminum-Copper Alloys)": 0.0025, "2011": 0.0026, "2014": 0.0027, "2017": 0.0028, "2024": 0.0029,
                        "3000 Series (Aluminum-Manganese Alloys)": 0.003, "3003": 0.0031, "3004": 0.0032, "3105": 0.0033, "3203": 0.0034,
                        "4000 Series (Aluminum-Silicon Alloys)": 0.0035, "4032": 0.0036, "4043": 0.0037, "4145": 0.0038, "4643": 0.0039,
                        "5000 Series (Aluminum-Magnesium Alloys)": 0.004, "5005": 0.0041, "5052": 0.0042, "5083": 0.0043, "5086": 0.0044, "5182": 0.0045, "5251": 0.0046, "5454": 0.0047, "5657": 0.0048,
                        "6000 Series (Aluminum-Magnesium-Silicon Alloys)": 0.005, "6005": 0.0051, "6061": 0.0052, "6063": 0.0053, "6082": 0.0054,
                        "7000 Series (Aluminum-Zinc Alloys)": 0.006, "7005": 0.0061, "7050": 0.0062, "7075": 0.0063, "7475": 0.0064,
                        "8000 Series (Other Elements)": 0.007, "8006": 0.0071, "8111": 0.0072, "8500": 0.0073, "8510": 0.0074, "8520": 0.0075
                    },
                    brass: {
                        "C21000 (Gilding Metal)": 0.003, "C22000 (Commercial Bronze)": 0.0031, "C23000 (Red Brass)": 0.0032, "C24000 (Low Brass)": 0.0033, "C26000 (Cartridge Brass)": 0.0034, "C28000 (Muntz Metal)": 0.0035, "C35300 (Leaded Brass)": 0.0036, "C36000 (Free-Cutting Brass)": 0.0037
                    },
                    bronze: {
                        "C22000 (Commercial Bronze)": 0.002, "C22600 (Red Brass)": 0.0021, "C51000 (Phosphor Bronze)": 0.0022, "C52100 (Phosphor Bronze)": 0.0023, "C54400 (Phosphor Bronze)": 0.0024, "C90300 (Tin Bronze)": 0.0025, "C90500 (Tin Bronze)": 0.0026, "C90700 (Tin Bronze)": 0.0027, "C93200 (Bearing Bronze)": 0.0028, "C95400 (Aluminum Bronze)": 0.0029, "C95900 (Aluminum Bronze)": 0.003, "C86300 (Manganese Bronze)": 0.0031
                    },
                    copper: {
                        "Pure Copper (C11000)": 0.0025, "Oxygen-Free Copper (C10100)": 0.0026, "Deoxidized High-Phosphorus Copper (C12200)": 0.0027, "Electrolytic Tough Pitch (ETP) Copper (C11000)": 0.0028, "Chromium Copper (C18200)": 0.0029, "Beryllium Copper (C17200)": 0.003, "Nickel Silver (C74500)": 0.0031, "Brass (C26000)": 0.0032, "Phosphor Bronze (C51000)": 0.0033, "Silicon Bronze (C65500)": 0.0034
                    },
                    nickel: {
                        "Nickel 200": 0.0015, "Nickel 201": 0.0015, "Nickel 205": 0.0015, "Nickel 270": 0.0016, "Nickel 400 (Monel 400)": 0.0016, "Nickel 404": 0.0016, "Nickel 600 (Inconel 600)": 0.0017, "Nickel 625 (Inconel 625)": 0.0017, "Nickel 718 (Inconel 718)": 0.0018, "Nickel K500 (Monel K500)": 0.0018, "Nickel 800 (Incoloy 800)": 0.0019, "Nickel 825 (Incoloy 825)": 0.0019
                    },
                    carbonSteel: {
                        "Low Carbon Steel": 0.0025, "1008 Steel": 0.0026, "1010 Steel": 0.0027, "1018 Steel": 0.0028, "1020 Steel": 0.0029,
                        "Medium Carbon Steel": 0.003, "1040 Steel": 0.0031, "1045 Steel": 0.0032, "1050 Steel": 0.0033, "1060 Steel": 0.0034,
                        "High Carbon Steel": 0.0035, "1070 Steel": 0.0036, "1080 Steel": 0.0037, "1090 Steel": 0.0038, "1095 Steel": 0.0039,
                        "Ultra-High Carbon Steel": 0.004, "1100 Steel": 0.0041, "1150 Steel": 0.0042, "1200 Steel": 0.0043
                    },
                    alloySteel: {
                        "4140 Alloy Steel": 0.0025, "4340 Alloy Steel": 0.0026, "4130 Alloy Steel": 0.0027, "8620 Alloy Steel": 0.0028, "9310 Alloy Steel": 0.0029,
                        "6150 Alloy Steel": 0.003, "4340V Alloy Steel": 0.0031, "52100 Alloy Steel": 0.0032, "300M Alloy Steel": 0.0033, "Maraging Steel (18Ni-300)": 0.0034, "Maraging Steel (18Ni-250)": 0.0035, "AISI 4145 Alloy Steel": 0.0036
                    },
                    stainlessSteel: {
                        "Austenitic Stainless Steel": 0.0025, "Ferritic Stainless Steel": 0.0026, "Martensitic Stainless Steel": 0.0027, "Duplex Stainless Steel": 0.0028, "Precipitation-Hardening Stainless Steel": 0.0029
                    },
                    toolSteel: {
                        "A2 Steel": 0.0015, "D2 Steel": 0.0016, "O1 Steel": 0.0017, "M2 Steel": 0.0018, "S7 Steel": 0.0019, "H13 Steel": 0.002, "W1 Steel": 0.0021
                    },
                    inconel: {
                        "Inconel 600": 0.0015, "Inconel 601": 0.0016, "Inconel 617": 0.0017, "Inconel 625": 0.0018, "Inconel 686": 0.0019,
                        "Inconel 690": 0.002, "Inconel 693": 0.0021, "Inconel 718": 0.0022, "Inconel 725": 0.0023, "Inconel 750": 0.0024, "Inconel 751": 0.0025, "Inconel 792": 0.0026, "Inconel X-750": 0.0027, "Inconel HX": 0.0028, "Inconel 939": 0.0029
                    },
                    titanium: {
                        "Grade 1 (Pure Titanium)": 0.0015, "Grade 2 (Commercially Pure Titanium)": 0.0016, "Grade 3 (Commercially Pure Titanium)": 0.0017, "Grade 4 (Commercially Pure Titanium)": 0.0018, "Grade 5 (Ti-6Al-4V)": 0.0019,
                        "Grade 6 (Al-4V-2Sn)": 0.002, "Grade 7 (Ti-0.2Pd)": 0.0021, "Grade 9 (Ti-3Al-2.5V)": 0.0022, "Grade 12 (Ti-0.3Mo-0.8Ni)": 0.0023, "Grade 23 (Ti-6Al-4V ELI)": 0.0024
                    },
                    magnesium: {
                        "AZ31B": 0.002, "AZ61A": 0.0021, "AZ80A": 0.0022, "ZK60A": 0.0023, "WE43": 0.0024, "Elektron 21": 0.0025, "Magnesium ZM21": 0.0026
                    },
                    zinc: {
                        "Zamak 2": 0.003, "Zamak 3": 0.0031, "Zamak 5": 0.0032, "Zamak 7": 0.0033, "ZA-8": 0.0034, "ZA-12": 0.0035, "ZA-27": 0.0036, "Zinc 1100": 0.0037, "Zinc 1600": 0.0038, "Zinc 3900": 0.0039
                    },
                    tungsten: {
                        "Pure Tungsten": 0.0015, "Tungsten Carbide": 0.0016, "Heavy Metal Alloys (W-Ni-Fe)": 0.0017, "Heavy Metal Alloys (W-Ni-Cu)": 0.0018, "Tungsten-Copper Alloys": 0.0019,
                        "Tungsten-Rhenium Alloys": 0.002, "Tungsten-Thorium Alloys": 0.0021, "Tungsten-Molybdenum Alloys": 0.0022
                    },
                    molybdenum: {
                        "Pure Molybdenum": 0.0015, "Molybdenum-Tungsten Alloys": 0.0016, "Molybdenum-Lanthanum Alloys": 0.0017, "TZM (Titanium-Zirconium-Molybdenum) Alloy": 0.0018, "Molybdenum-Rhenium Alloys": 0.0019
                    },
                    cobalt: {
                        "Cobalt 6B": 0.0015, "Cobalt 6K": 0.0016, "Cobalt L-605": 0.0017, "Cobalt R-41": 0.0018, "Cobalt FSX-414": 0.0019, "Cobalt HS-188": 0.002, "Cobalt MAR-M-509": 0.0021, "Cobalt MAR-M-918": 0.0022
                    },
                    gold: {
                        "24K Gold (99.9% Pure)": 0.001, "22K Gold": 0.0011, "18K Gold": 0.0012, "14K Gold": 0.0013, "10K Gold": 0.0014, "White Gold": 0.0015, "Rose Gold": 0.0016, "Green Gold": 0.0017
                    },
                    silver: {
                        "Fine Silver (99.9% Pure)": 0.001, "Sterling Silver (92.5% Silver, 7.5% Copper)": 0.0011, "Argentium Silver (93.5% or 96% Silver)": 0.0012, "Coin Silver (90% Silver, 10% Copper)": 0.0013, "Britannia Silver (95.8% Silver)": 0.0014
                    },
                    platinum: {
                        "Pt 950 (95% Platinum, 5% Other Metals)": 0.0015, "Pt 900 (90% Platinum, 10% Other Metals)": 0.0016, "Pt 850 (85% Platinum, 15% Other Metals)": 0.0017, "Iridium-Platinum Alloys": 0.0018, "Ruthenium-Platinum Alloys": 0.0019
                    },
                    palladium: {
                        "Pd 500 (50% Palladium, 50% Silver)": 0.0015, "Pd 950 (95% Palladium, 5% Other Metals)": 0.0016, "Pd 999 (99.9% Pure Palladium)": 0.0017, "Palladium-Silver Alloys": 0.0018, "Palladium-Copper Alloys": 0.0019
                    },
                    lead: {
                        "Pure Lead": 0.001, "Lead-Antimony Alloys": 0.0011, "Lead-Tin Alloys": 0.0012, "Lead-Calcium Alloys": 0.0013, "Lead-Silver Alloys": 0.0014
                    },
                    tin: {
                        "Pure Tin": 0.001, "Tin-Lead Alloys (Solder)": 0.0011, "Tin-Silver Alloys": 0.0012, "Tin-Copper Alloys (Bronze)": 0.0013, "Tin-Zinc Alloys": 0.0014
                    },
                    zirconium: {
                        "Zirconium 702 (Pure Zirconium)": 0.001, "Zirconium 704 (Zr-2.5Nb)": 0.0011, "Zirconium 705 (Zr-3Al-2.5Nb)": 0.0012, "Zircaloy-2 (Zr-Sn-Fe-Cr-Ni)": 0.0013, "Zircaloy-4 (Zr-Sn-Fe-Cr)": 0.0014
                    },
                    plastics: {
                        "Polyethylene (PE)": 0.002, "High-Density Polyethylene (HDPE)": 0.0021, "Low-Density Polyethylene (LDPE)": 0.0022, "Linear Low-Density Polyethylene (LLDPE)": 0.0023,
                        "Polypropylene (PP)": 0.0024, "Polyvinyl Chloride (PVC)": 0.0025, "Polystyrene (PS)": 0.0026, "High Impact Polystyrene (HIPS)": 0.0027, "Expanded Polystyrene (EPS)": 0.0028,
                        "Polyethylene Terephthalate (PET)": 0.0029, "Polycarbonate (PC)": 0.003, "Acrylonitrile Butadiene Styrene (ABS)": 0.0031, "Nylon (Polyamide, PA)": 0.0032,
                        "Polytetrafluoroethylene (PTFE, Teflon)": 0.0033, "Polyoxymethylene (POM, Acetal)": 0.0034, "Polyethylene Chlorinated (CPE)": 0.0035, "Polyurethane (PU)": 0.0036,
                        "Polylactic Acid (PLA)": 0.0037, "Polyethylene Naphthalate (PEN)": 0.0038, "Polybutylene Terephthalate (PBT)": 0.0039, "Polyetheretherketone (PEEK)": 0.004,
                        "Polyphenylene Oxide (PPO)": 0.0041, "Polysulfone (PSU)": 0.0042
                    },
                    glass: {
                        "Soda-Lime Glass": 0.0015, "Borosilicate Glass": 0.0016, "Lead Glass (Crystal)": 0.0017, "Aluminosilicate Glass": 0.0018, "Fused Silica Glass": 0.0019,
                        "Chemically Strengthened Glass": 0.002, "Laminated Glass": 0.0021, "Tempered Glass": 0.0022, "Glass Ceramic": 0.0023, "Optical Glass": 0.0024
                    },
                    wood: {
                        "Hardwood": 0.005, "Oak": 0.0051, "Maple": 0.0052, "Cherry": 0.0053, "Walnut": 0.0054, "Mahogany": 0.0055, "Teak": 0.0056, "Birch": 0.0057, "Ash": 0.0058, "Beech": 0.0059,
                        "Softwood": 0.006, "Pine": 0.0061, "Cedar": 0.0062, "Fir": 0.0063, "Spruce": 0.0064, "Redwood": 0.0065, "Hemlock": 0.0066,
                        "Engineered Wood": 0.0067, "Plywood": 0.0068, "Medium Density Fiberboard (MDF)": 0.0069, "Particle Board": 0.007, "Oriented Strand Board (OSB)": 0.0071, "Laminated Veneer Lumber (LVL)": 0.0072, "Cross-Laminated Timber (CLT)": 0.0073, "Glulam (Glued Laminated Timber)": 0.0074
                    }
                }
            };
    
            if (baseFeedRates[tool] && baseFeedRates[tool][material] && baseFeedRates[tool][material][alloy]) {
                return `${(baseFeedRates[tool][material][alloy] * diameter *10000).toFixed(2)} ${unitSelect.value}/min`;
            }
    
            return 'N/A'; // Return 'N/A' if no matching feed rate is found
        }
    
        function calculateSpeed(tool, diameter, material, alloy) {
            // Speed calculation logic based on tool, diameter, material, and alloy
            const baseSpeeds = {
                hssDrill: {
                    aluminum: {
                        "1000 Series (Commercially Pure Aluminum)": 100, "1050": 105, "1060": 110, "1070": 115, "1100": 120,
                        "2000 Series (Aluminum-Copper Alloys)": 125, "2011": 130, "2014": 135, "2017": 140, "2024": 145,
                        "3000 Series (Aluminum-Manganese Alloys)": 150, "3003": 155, "3004": 160, "3105": 165, "3203": 170,
                        "4000 Series (Aluminum-Silicon Alloys)": 175, "4032": 180, "4043": 185, "4145": 190, "4643": 195,
                        "5000 Series (Aluminum-Magnesium Alloys)": 200, "5005": 205, "5052": 210, "5083": 215, "5086": 220, "5182": 225, "5251": 230, "5454": 235, "5657": 240,
                        "6000 Series (Aluminum-Magnesium-Silicon Alloys)": 245, "6005": 250, "6061": 255, "6063": 260, "6082": 265,
                        "7000 Series (Aluminum-Zinc Alloys)": 270, "7005": 275, "7050": 280, "7075": 285, "7475": 290,
                        "8000 Series (Other Elements)": 295, "8006": 300, "8111": 305, "8500": 310, "8510": 315, "8520": 320
                    },
                    brass: {
                        "C21000 (Gilding Metal)": 80, "C22000 (Commercial Bronze)": 82, "C23000 (Red Brass)": 84, "C24000 (Low Brass)": 86, "C26000 (Cartridge Brass)": 88, "C28000 (Muntz Metal)": 90, "C35300 (Leaded Brass)": 92, "C36000 (Free-Cutting Brass)": 94
                    },
                    bronze: {
                        "C22000 (Commercial Bronze)": 70, "C22600 (Red Brass)": 72, "C51000 (Phosphor Bronze)": 74, "C52100 (Phosphor Bronze)": 76, "C54400 (Phosphor Bronze)": 78, "C90300 (Tin Bronze)": 80, "C90500 (Tin Bronze)": 82, "C90700 (Tin Bronze)": 84, "C93200 (Bearing Bronze)": 86, "C95400 (Aluminum Bronze)": 88, "C95900 (Aluminum Bronze)": 90, "C86300 (Manganese Bronze)": 92
                    },
                    copper: {
                        "Pure Copper (C11000)": 90, "Oxygen-Free Copper (C10100)": 92, "Deoxidized High-Phosphorus Copper (C12200)": 94, "Electrolytic Tough Pitch (ETP) Copper (C11000)": 96, "Chromium Copper (C18200)": 98, "Beryllium Copper (C17200)": 100, "Nickel Silver (C74500)": 102, "Brass (C26000)": 104, "Phosphor Bronze (C51000)": 106, "Silicon Bronze (C65500)": 108
                    },
                    nickel: {
                        "Nickel 200": 65, "Nickel 201": 66, "Nickel 205": 67, "Nickel 270": 68, "Nickel 400 (Monel 400)": 69, "Nickel 404": 70, "Nickel 600 (Inconel 600)": 71, "Nickel 625 (Inconel 625)": 72, "Nickel 718 (Inconel 718)": 73, "Nickel K500 (Monel K500)": 74, "Nickel 800 (Incoloy 800)": 75, "Nickel 825 (Incoloy 825)": 76
                    },
                    carbonSteel: {
                        "Low Carbon Steel": 90, "1008 Steel": 92, "1010 Steel": 94, "1018 Steel": 96, "1020 Steel": 98,
                        "Medium Carbon Steel": 100, "1040 Steel": 102, "1045 Steel": 104, "1050 Steel": 106, "1060 Steel": 108,
                        "High Carbon Steel": 110, "1070 Steel": 112, "1080 Steel": 114, "1090 Steel": 116, "1095 Steel": 118,
                        "Ultra-High Carbon Steel": 120, "1100 Steel": 122, "1150 Steel": 124, "1200 Steel": 126
                    },
                    alloySteel: {
                        "4140 Alloy Steel": 95, "4340 Alloy Steel": 97, "4130 Alloy Steel": 99, "8620 Alloy Steel": 101, "9310 Alloy Steel": 103,
                        "6150 Alloy Steel": 105, "4340V Alloy Steel": 107, "52100 Alloy Steel": 109, "300M Alloy Steel": 111, "Maraging Steel (18Ni-300)": 113, "Maraging Steel (18Ni-250)": 115, "AISI 4145 Alloy Steel": 117
                    },
                    stainlessSteel: {
                        "Austenitic Stainless Steel": 85, "Ferritic Stainless Steel": 87, "Martensitic Stainless Steel": 89, "Duplex Stainless Steel": 91, "Precipitation-Hardening Stainless Steel": 93
                    },
                    toolSteel: {
                        "A2 Steel": 70, "D2 Steel": 71, "O1 Steel": 72, "M2 Steel": 73, "S7 Steel": 74, "H13 Steel": 75, "W1 Steel": 76
                    },
                    inconel: {
                        "Inconel 600": 65, "Inconel 601": 66, "Inconel 617": 67, "Inconel 625": 68, "Inconel 686": 69,
                        "Inconel 690": 70, "Inconel 693": 71, "Inconel 718": 72, "Inconel 725": 73, "Inconel 750": 74, "Inconel 751": 75, "Inconel 792": 76, "Inconel X-750": 77, "Inconel HX": 78, "Inconel 939": 79
                    },
                    titanium: {
                        "Grade 1 (Pure Titanium)": 75, "Grade 2 (Commercially Pure Titanium)": 76, "Grade 3 (Commercially Pure Titanium)": 77, "Grade 4 (Commercially Pure Titanium)": 78, "Grade 5 (Ti-6Al-4V)": 79,
                        "Grade 6 (Al-4V-2Sn)": 80, "Grade 7 (Ti-0.2Pd)": 81, "Grade 9 (Ti-3Al-2.5V)": 82, "Grade 12 (Ti-0.3Mo-0.8Ni)": 83, "Grade 23 (Ti-6Al-4V ELI)": 84
                    },
                    magnesium: {
                        "AZ31B": 85, "AZ61A": 86, "AZ80A": 87, "ZK60A": 88, "WE43": 89, "Elektron 21": 90, "Magnesium ZM21": 91
                    },
                    zinc: {
                        "Zamak 2": 220, "Zamak 3": 225, "Zamak 5": 230, "Zamak 7": 235, "ZA-8": 240, "ZA-12": 245, "ZA-27": 250, "Zinc 1100": 255, "Zinc 1600": 260, "Zinc 3900": 265
                    },
                    tungsten: {
                        "Pure Tungsten": 60, "Tungsten Carbide": 61, "Heavy Metal Alloys (W-Ni-Fe)": 62, "Heavy Metal Alloys (W-Ni-Cu)": 63, "Tungsten-Copper Alloys": 64,
                        "Tungsten-Rhenium Alloys": 65, "Tungsten-Thorium Alloys": 66, "Tungsten-Molybdenum Alloys": 67
                    },
                    molybdenum: {
                        "Pure Molybdenum": 68, "Molybdenum-Tungsten Alloys": 69, "Molybdenum-Lanthanum Alloys": 70, "TZM (Titanium-Zirconium-Molybdenum) Alloy": 71, "Molybdenum-Rhenium Alloys": 72
                    },
                    cobalt: {
                        "Cobalt 6B": 80, "Cobalt 6K": 81, "Cobalt L-605": 82, "Cobalt R-41": 83, "Cobalt FSX-414": 84, "Cobalt HS-188": 85, "Cobalt MAR-M-509": 86, "Cobalt MAR-M-918": 87
                    },
                    gold: {
                        "24K Gold (99.9% Pure)": 30, "22K Gold": 32, "18K Gold": 34, "14K Gold": 36, "10K Gold": 38, "White Gold": 40, "Rose Gold": 42, "Green Gold": 44
                    },
                    silver: {
                        "Fine Silver (99.9% Pure)": 55, "Sterling Silver (92.5% Silver, 7.5% Copper)": 57, "Argentium Silver (93.5% or 96% Silver)": 59, "Coin Silver (90% Silver, 10% Copper)": 61, "Britannia Silver (95.8% Silver)": 63
                    },
                    platinum: {
                        "Pt 950 (95% Platinum, 5% Other Metals)": 70, "Pt 900 (90% Platinum, 10% Other Metals)": 72, "Pt 850 (85% Platinum, 15% Other Metals)": 74, "Iridium-Platinum Alloys": 76, "Ruthenium-Platinum Alloys": 78
                    },
                    palladium: {
                        "Pd 500 (50% Palladium, 50% Silver)": 60, "Pd 950 (95% Palladium, 5% Other Metals)": 62, "Pd 999 (99.9% Pure Palladium)": 64, "Palladium-Silver Alloys": 66, "Palladium-Copper Alloys": 68
                    },
                    lead: {
                        "Pure Lead": 50, "Lead-Antimony Alloys": 52, "Lead-Tin Alloys": 54, "Lead-Calcium Alloys": 56, "Lead-Silver Alloys": 58
                    },
                    tin: {
                        "Pure Tin": 45, "Tin-Lead Alloys (Solder)": 47, "Tin-Silver Alloys": 49, "Tin-Copper Alloys (Bronze)": 51, "Tin-Zinc Alloys": 53
                    },
                    zirconium: {
                        "Zirconium 702 (Pure Zirconium)": 75, "Zirconium 704 (Zr-2.5Nb)": 77, "Zirconium 705 (Zr-3Al-2.5Nb)": 79, "Zircaloy-2 (Zr-Sn-Fe-Cr-Ni)": 81, "Zircaloy-4 (Zr-Sn-Fe-Cr)": 83
                    },
                    plastics: {
                        "Polyethylene (PE)": 200, "High-Density Polyethylene (HDPE)": 205, "Low-Density Polyethylene (LDPE)": 210, "Linear Low-Density Polyethylene (LLDPE)": 215,
                        "Polypropylene (PP)": 220, "Polyvinyl Chloride (PVC)": 225, "Polystyrene (PS)": 230, "High Impact Polystyrene (HIPS)": 235, "Expanded Polystyrene (EPS)": 240,
                        "Polyethylene Terephthalate (PET)": 245, "Polycarbonate (PC)": 250, "Acrylonitrile Butadiene Styrene (ABS)": 255, "Nylon (Polyamide, PA)": 260,
                        "Polytetrafluoroethylene (PTFE, Teflon)": 265, "Polyoxymethylene (POM, Acetal)": 270, "Polyethylene Chlorinated (CPE)": 275, "Polyurethane (PU)": 280,
                        "Polylactic Acid (PLA)": 285, "Polyethylene Naphthalate (PEN)": 290, "Polybutylene Terephthalate (PBT)": 295, "Polyetheretherketone (PEEK)": 300,
                        "Polyphenylene Oxide (PPO)": 305, "Polysulfone (PSU)": 310
                    },
                    glass: {
                        "Soda-Lime Glass": 70, "Borosilicate Glass": 71, "Lead Glass (Crystal)": 72, "Aluminosilicate Glass": 73, "Fused Silica Glass": 74,
                        "Chemically Strengthened Glass": 75, "Laminated Glass": 76, "Tempered Glass": 77, "Glass Ceramic": 78, "Optical Glass": 79
                    },
                    wood: {
                        "Hardwood": 80, "Oak": 82, "Maple": 84, "Cherry": 86, "Walnut": 88, "Mahogany": 90, "Teak": 92, "Birch": 94, "Ash": 96, "Beech": 98,
                        "Softwood": 100, "Pine": 102, "Cedar": 104, "Fir": 106, "Spruce": 108, "Redwood": 110, "Hemlock": 112,
                        "Engineered Wood": 114, "Plywood": 116, "Medium Density Fiberboard (MDF)": 118, "Particle Board": 120, "Oriented Strand Board (OSB)": 122, "Laminated Veneer Lumber (LVL)": 124, "Cross-Laminated Timber (CLT)": 126, "Glulam (Glued Laminated Timber)": 128
                    }
                },
                carbideDrill: {
                    aluminum: {
                        "1000 Series (Commercially Pure Aluminum)": 300, "1050": 305, "1060": 310, "1070": 315, "1100": 320,
                        "2000 Series (Aluminum-Copper Alloys)": 325, "2011": 330, "2014": 335, "2017": 340, "2024": 345,
                        "3000 Series (Aluminum-Manganese Alloys)": 350, "3003": 355, "3004": 360, "3105": 365, "3203": 370,
                        "4000 Series (Aluminum-Silicon Alloys)": 375, "4032": 380, "4043": 385, "4145": 390, "4643": 395,
                        "5000 Series (Aluminum-Magnesium Alloys)": 400, "5005": 405, "5052": 410, "5083": 415, "5086": 420, "5182": 425, "5251": 430, "5454": 435, "5657": 440,
                        "6000 Series (Aluminum-Magnesium-Silicon Alloys)": 445, "6005": 450, "6061": 455, "6063": 460, "6082": 465,
                        "7000 Series (Aluminum-Zinc Alloys)": 470, "7005": 475, "7050": 480, "7075": 485, "7475": 490,
                        "8000 Series (Other Elements)": 495, "8006": 500, "8111": 505, "8500": 510, "8510": 515, "8520": 520
                    },
                    brass: {
                        "C21000 (Gilding Metal)": 250, "C22000 (Commercial Bronze)": 255, "C23000 (Red Brass)": 260, "C24000 (Low Brass)": 265, "C26000 (Cartridge Brass)": 270, "C28000 (Muntz Metal)": 275, "C35300 (Leaded Brass)": 280, "C36000 (Free-Cutting Brass)": 285
                    },
                    bronze: {
                        "C22000 (Commercial Bronze)": 200, "C22600 (Red Brass)": 205, "C51000 (Phosphor Bronze)": 210, "C52100 (Phosphor Bronze)": 215, "C54400 (Phosphor Bronze)": 220, "C90300 (Tin Bronze)": 225, "C90500 (Tin Bronze)": 230, "C90700 (Tin Bronze)": 235, "C93200 (Bearing Bronze)": 240, "C95400 (Aluminum Bronze)": 245, "C95900 (Aluminum Bronze)": 250, "C86300 (Manganese Bronze)": 255
                    },
                    copper: {
                        "Pure Copper (C11000)": 220, "Oxygen-Free Copper (C10100)": 225, "Deoxidized High-Phosphorus Copper (C12200)": 230, "Electrolytic Tough Pitch (ETP) Copper (C11000)": 235, "Chromium Copper (C18200)": 240, "Beryllium Copper (C17200)": 245, "Nickel Silver (C74500)": 250, "Brass (C26000)": 255, "Phosphor Bronze (C51000)": 260, "Silicon Bronze (C65500)": 265
                    },
                    nickel: {
                        "Nickel 200": 195, "Nickel 201": 200, "Nickel 205": 205, "Nickel 270": 210, "Nickel 400 (Monel 400)": 215, "Nickel 404": 220, "Nickel 600 (Inconel 600)": 225, "Nickel 625 (Inconel 625)": 230, "Nickel 718 (Inconel 718)": 235, "Nickel K500 (Monel K500)": 240, "Nickel 800 (Incoloy 800)": 245, "Nickel 825 (Incoloy 825)": 250
                    },
                    carbonSteel: {
                        "Low Carbon Steel": 200, "1008 Steel": 205, "1010 Steel": 210, "1018 Steel": 215, "1020 Steel": 220,
                        "Medium Carbon Steel": 225, "1040 Steel": 230, "1045 Steel": 235, "1050 Steel": 240, "1060 Steel": 245,
                        "High Carbon Steel": 250, "1070 Steel": 255, "1080 Steel": 260, "1090 Steel": 265, "1095 Steel": 270,
                        "Ultra-High Carbon Steel": 275, "1100 Steel": 280, "1150 Steel": 285, "1200 Steel": 290
                    },
                    alloySteel: {
                        "4140 Alloy Steel": 175, "4340 Alloy Steel": 180, "4130 Alloy Steel": 185, "8620 Alloy Steel": 190, "9310 Alloy Steel": 195,
                        "6150 Alloy Steel": 200, "4340V Alloy Steel": 205, "52100 Alloy Steel": 210, "300M Alloy Steel": 215, "Maraging Steel (18Ni-300)": 220, "Maraging Steel (18Ni-250)": 225, "AISI 4145 Alloy Steel": 230
                    },
                    stainlessSteel: {
                        "Austenitic Stainless Steel": 170, "Ferritic Stainless Steel": 175, "Martensitic Stainless Steel": 180, "Duplex Stainless Steel": 185, "Precipitation-Hardening Stainless Steel": 190
                    },
                    toolSteel: {
                        "A2 Steel": 160, "D2 Steel": 165, "O1 Steel": 170, "M2 Steel": 175, "S7 Steel": 180, "H13 Steel": 185, "W1 Steel": 190
                    },
                    inconel: {
                        "Inconel 600": 150, "Inconel 601": 155, "Inconel 617": 160, "Inconel 625": 165, "Inconel 686": 170,
                        "Inconel 690": 175, "Inconel 693": 180, "Inconel 718": 185, "Inconel 725": 190, "Inconel 750": 195, "Inconel 751": 200, "Inconel 792": 205, "Inconel X-750": 210, "Inconel HX": 215, "Inconel 939": 220
                    },
                    titanium: {
                        "Grade 1 (Pure Titanium)": 195, "Grade 2 (Commercially Pure Titanium)": 200, "Grade 3 (Commercially Pure Titanium)": 205, "Grade 4 (Commercially Pure Titanium)": 210, "Grade 5 (Ti-6Al-4V)": 215,
                        "Grade 6 (Al-4V-2Sn)": 220, "Grade 7 (Ti-0.2Pd)": 225, "Grade 9 (Ti-3Al-2.5V)": 230, "Grade 12 (Ti-0.3Mo-0.8Ni)": 235, "Grade 23 (Ti-6Al-4V ELI)": 240
                    },
                    magnesium: {
                        "AZ31B": 185, "AZ61A": 190, "AZ80A": 195, "ZK60A": 200, "WE43": 205, "Elektron 21": 210, "Magnesium ZM21": 215
                    },
                    zinc: {
                        "Zamak 2": 275, "Zamak 3": 280, "Zamak 5": 285, "Zamak 7": 290, "ZA-8": 295, "ZA-12": 300, "ZA-27": 305, "Zinc 1100": 310, "Zinc 1600": 315, "Zinc 3900": 320
                    },
                    tungsten: {
                        "Pure Tungsten": 160, "Tungsten Carbide": 165, "Heavy Metal Alloys (W-Ni-Fe)": 170, "Heavy Metal Alloys (W-Ni-Cu)": 175, "Tungsten-Copper Alloys": 180,
                        "Tungsten-Rhenium Alloys": 185, "Tungsten-Thorium Alloys": 190, "Tungsten-Molybdenum Alloys": 195
                    },
                    molybdenum: {
                        "Pure Molybdenum": 180, "Molybdenum-Tungsten Alloys": 185, "Molybdenum-Lanthanum Alloys": 190, "TZM (Titanium-Zirconium-Molybdenum) Alloy": 195, "Molybdenum-Rhenium Alloys": 200
                    },
                    cobalt: {
                        "Cobalt 6B": 170, "Cobalt 6K": 175, "Cobalt L-605": 180, "Cobalt R-41": 185, "Cobalt FSX-414": 190, "Cobalt HS-188": 195, "Cobalt MAR-M-509": 200, "Cobalt MAR-M-918": 205
                    },
                    gold: {
                        "24K Gold (99.9% Pure)": 95, "22K Gold": 97, "18K Gold": 99, "14K Gold": 101, "10K Gold": 103, "White Gold": 105, "Rose Gold": 107, "Green Gold": 109
                    },
                    silver: {
                        "Fine Silver (99.9% Pure)": 145, "Sterling Silver (92.5% Silver, 7.5% Copper)": 147, "Argentium Silver (93.5% or 96% Silver)": 149, "Coin Silver (90% Silver, 10% Copper)": 151, "Britannia Silver (95.8% Silver)": 153
                    },
                    platinum: {
                        "Pt 950 (95% Platinum, 5% Other Metals)": 120, "Pt 900 (90% Platinum, 10% Other Metals)": 122, "Pt 850 (85% Platinum, 15% Other Metals)": 124, "Iridium-Platinum Alloys": 126, "Ruthenium-Platinum Alloys": 128
                    },
                    palladium: {
                        "Pd 500 (50% Palladium, 50% Silver)": 110, "Pd 950 (95% Palladium, 5% Other Metals)": 112, "Pd 999 (99.9% Pure Palladium)": 114, "Palladium-Silver Alloys": 116, "Palladium-Copper Alloys": 118
                    },
                    lead: {
                        "Pure Lead": 80, "Lead-Antimony Alloys": 82, "Lead-Tin Alloys": 84, "Lead-Calcium Alloys": 86, "Lead-Silver Alloys": 88
                    },
                    tin: {
                        "Pure Tin": 70, "Tin-Lead Alloys (Solder)": 72, "Tin-Silver Alloys": 74, "Tin-Copper Alloys (Bronze)": 76, "Tin-Zinc Alloys": 78
                    },
                    zirconium: {
                        "Zirconium 702 (Pure Zirconium)": 110, "Zirconium 704 (Zr-2.5Nb)": 112, "Zirconium 705 (Zr-3Al-2.5Nb)": 114, "Zircaloy-2 (Zr-Sn-Fe-Cr-Ni)": 116, "Zircaloy-4 (Zr-Sn-Fe-Cr)": 118
                    },
                    plastics: {
                        "Polyethylene (PE)": 800, "High-Density Polyethylene (HDPE)": 805, "Low-Density Polyethylene (LDPE)": 810, "Linear Low-Density Polyethylene (LLDPE)": 815,
                        "Polypropylene (PP)": 820, "Polyvinyl Chloride (PVC)": 825, "Polystyrene (PS)": 830, "High Impact Polystyrene (HIPS)": 835, "Expanded Polystyrene (EPS)": 840,
                        "Polyethylene Terephthalate (PET)": 845, "Polycarbonate (PC)": 850, "Acrylonitrile Butadiene Styrene (ABS)": 855, "Nylon (Polyamide, PA)": 860,
                        "Polytetrafluoroethylene (PTFE, Teflon)": 865, "Polyoxymethylene (POM, Acetal)": 870, "Polyethylene Chlorinated (CPE)": 875, "Polyurethane (PU)": 880,
                        "Polylactic Acid (PLA)": 885, "Polyethylene Naphthalate (PEN)": 890, "Polybutylene Terephthalate (PBT)": 895, "Polyetheretherketone (PEEK)": 900,
                        "Polyphenylene Oxide (PPO)": 905, "Polysulfone (PSU)": 910
                    },
                    glass: {
                        "Soda-Lime Glass": 200, "Borosilicate Glass": 205, "Lead Glass (Crystal)": 210, "Aluminosilicate Glass": 215, "Fused Silica Glass": 220,
                        "Chemically Strengthened Glass": 225, "Laminated Glass": 230, "Tempered Glass": 235, "Glass Ceramic": 240, "Optical Glass": 245
                    },
                    wood: {
                        "Hardwood": 250, "Oak": 255, "Maple": 260, "Cherry": 265, "Walnut": 270, "Mahogany": 275, "Teak": 280, "Birch": 285, "Ash": 290, "Beech": 295,
                        "Softwood": 300, "Pine": 305, "Cedar": 310, "Fir": 315, "Spruce": 320, "Redwood": 325, "Hemlock": 330,
                        "Engineered Wood": 335, "Plywood": 340, "Medium Density Fiberboard (MDF)": 345, "Particle Board": 350, "Oriented Strand Board (OSB)": 355, "Laminated Veneer Lumber (LVL)": 360, "Cross-Laminated Timber (CLT)": 365, "Glulam (Glued Laminated Timber)": 370
                    }
                },
                insertDrill: {
                    aluminum: {
                        "1000 Series (Commercially Pure Aluminum)": 200, "1050": 205, "1060": 210, "1070": 215, "1100": 220,
                        "2000 Series (Aluminum-Copper Alloys)": 225, "2011": 230, "2014": 235, "2017": 240, "2024": 245,
                        "3000 Series (Aluminum-Manganese Alloys)": 250, "3003": 255, "3004": 260, "3105": 265, "3203": 270,
                        "4000 Series (Aluminum-Silicon Alloys)": 275, "4032": 280, "4043": 285, "4145": 290, "4643": 295,
                        "5000 Series (Aluminum-Magnesium Alloys)": 300, "5005": 305, "5052": 310, "5083": 315, "5086": 320, "5182": 325, "5251": 330, "5454": 335, "5657": 340,
                        "6000 Series (Aluminum-Magnesium-Silicon Alloys)": 345, "6005": 350, "6061": 355, "6063": 360, "6082": 365,
                        "7000 Series (Aluminum-Zinc Alloys)": 370, "7005": 375, "7050": 380, "7075": 385, "7475": 390,
                        "8000 Series (Other Elements)": 395, "8006": 400, "8111": 405, "8500": 410, "8510": 415, "8520": 420
                    },
                    brass: {
                        "C21000 (Gilding Metal)": 150, "C22000 (Commercial Bronze)": 155, "C23000 (Red Brass)": 160, "C24000 (Low Brass)": 165, "C26000 (Cartridge Brass)": 170, "C28000 (Muntz Metal)": 175, "C35300 (Leaded Brass)": 180, "C36000 (Free-Cutting Brass)": 185
                    },
                    bronze: {
                        "C22000 (Commercial Bronze)": 100, "C22600 (Red Brass)": 105, "C51000 (Phosphor Bronze)": 110, "C52100 (Phosphor Bronze)": 115, "C54400 (Phosphor Bronze)": 120, "C90300 (Tin Bronze)": 125, "C90500 (Tin Bronze)": 130, "C90700 (Tin Bronze)": 135, "C93200 (Bearing Bronze)": 140, "C95400 (Aluminum Bronze)": 145, "C95900 (Aluminum Bronze)": 150, "C86300 (Manganese Bronze)": 155
                    },
                    copper: {
                        "Pure Copper (C11000)": 120, "Oxygen-Free Copper (C10100)": 125, "Deoxidized High-Phosphorus Copper (C12200)": 130, "Electrolytic Tough Pitch (ETP) Copper (C11000)": 135, "Chromium Copper (C18200)": 140, "Beryllium Copper (C17200)": 145, "Nickel Silver (C74500)": 150, "Brass (C26000)": 155, "Phosphor Bronze (C51000)": 160, "Silicon Bronze (C65500)": 165
                    },
                    nickel: {
                        "Nickel 200": 95, "Nickel 201": 100, "Nickel 205": 105, "Nickel 270": 110, "Nickel 400 (Monel 400)": 115, "Nickel 404": 120, "Nickel 600 (Inconel 600)": 125, "Nickel 625 (Inconel 625)": 130, "Nickel 718 (Inconel 718)": 135, "Nickel K500 (Monel K500)": 140, "Nickel 800 (Incoloy 800)": 145, "Nickel 825 (Incoloy 825)": 150
                    },
                    carbonSteel: {
                        "Low Carbon Steel": 110, "1008 Steel": 115, "1010 Steel": 120, "1018 Steel": 125, "1020 Steel": 130,
                        "Medium Carbon Steel": 135, "1040 Steel": 140, "1045 Steel": 145, "1050 Steel": 150, "1060 Steel": 155,
                        "High Carbon Steel": 160, "1070 Steel": 165, "1080 Steel": 170, "1090 Steel": 175, "1095 Steel": 180,
                        "Ultra-High Carbon Steel": 185, "1100 Steel": 190, "1150 Steel": 195, "1200 Steel": 200
                    },
                    alloySteel: {
                        "4140 Alloy Steel": 100, "4340 Alloy Steel": 105, "4130 Alloy Steel": 110, "8620 Alloy Steel": 115, "9310 Alloy Steel": 120,
                        "6150 Alloy Steel": 125, "4340V Alloy Steel": 130, "52100 Alloy Steel": 135, "300M Alloy Steel": 140, "Maraging Steel (18Ni-300)": 145, "Maraging Steel (18Ni-250)": 150, "AISI 4145 Alloy Steel": 155
                    },
                    stainlessSteel: {
                        "Austenitic Stainless Steel": 90, "Ferritic Stainless Steel": 95, "Martensitic Stainless Steel": 100, "Duplex Stainless Steel": 105, "Precipitation-Hardening Stainless Steel": 110
                    },
                    toolSteel: {
                        "A2 Steel": 85, "D2 Steel": 90, "O1 Steel": 95, "M2 Steel": 100, "S7 Steel": 105, "H13 Steel": 110, "W1 Steel": 115
                    },
                    inconel: {
                        "Inconel 600": 80, "Inconel 601": 85, "Inconel 617": 90, "Inconel 625": 95, "Inconel 686": 100,
                        "Inconel 690": 105, "Inconel 693": 110, "Inconel 718": 115, "Inconel 725": 120, "Inconel 750": 125, "Inconel 751": 130, "Inconel 792": 135, "Inconel X-750": 140, "Inconel HX": 145, "Inconel 939": 150
                    },
                    titanium: {
                        "Grade 1 (Pure Titanium)": 110, "Grade 2 (Commercially Pure Titanium)": 115, "Grade 3 (Commercially Pure Titanium)": 120, "Grade 4 (Commercially Pure Titanium)": 125, "Grade 5 (Ti-6Al-4V)": 130,
                        "Grade 6 (Al-4V-2Sn)": 135, "Grade 7 (Ti-0.2Pd)": 140, "Grade 9 (Ti-3Al-2.5V)": 145, "Grade 12 (Ti-0.3Mo-0.8Ni)": 150, "Grade 23 (Ti-6Al-4V ELI)": 155
                    },
                    magnesium: {
                        "AZ31B": 100, "AZ61A": 105, "AZ80A": 110, "ZK60A": 115, "WE43": 120, "Elektron 21": 125, "Magnesium ZM21": 130
                    },
                    zinc: {
                        "Zamak 2": 150, "Zamak 3": 155, "Zamak 5": 160, "Zamak 7": 165, "ZA-8": 170, "ZA-12": 175, "ZA-27": 180, "Zinc 1100": 185, "Zinc 1600": 190, "Zinc 3900": 195
                    },
                    tungsten: {
                        "Pure Tungsten": 70, "Tungsten Carbide": 75, "Heavy Metal Alloys (W-Ni-Fe)": 80, "Heavy Metal Alloys (W-Ni-Cu)": 85, "Tungsten-Copper Alloys": 90,
                        "Tungsten-Rhenium Alloys": 95, "Tungsten-Thorium Alloys": 100, "Tungsten-Molybdenum Alloys": 105
                    },
                    molybdenum: {
                        "Pure Molybdenum": 90, "Molybdenum-Tungsten Alloys": 95, "Molybdenum-Lanthanum Alloys": 100, "TZM (Titanium-Zirconium-Molybdenum) Alloy": 105, "Molybdenum-Rhenium Alloys": 110
                    },
                    cobalt: {
                        "Cobalt 6B": 100, "Cobalt 6K": 105, "Cobalt L-605": 110, "Cobalt R-41": 115, "Cobalt FSX-414": 120, "Cobalt HS-188": 125, "Cobalt MAR-M-509": 130, "Cobalt MAR-M-918": 135
                    },
                    gold: {
                        "24K Gold (99.9% Pure)": 55, "22K Gold": 57, "18K Gold": 59, "14K Gold": 61, "10K Gold": 63, "White Gold": 65, "Rose Gold": 67, "Green Gold": 69
                    },
                    silver: {
                        "Fine Silver (99.9% Pure)": 70, "Sterling Silver (92.5% Silver, 7.5% Copper)": 72, "Argentium Silver (93.5% or 96% Silver)": 74, "Coin Silver (90% Silver, 10% Copper)": 76, "Britannia Silver (95.8% Silver)": 78
                    },
                    platinum: {
                        "Pt 950 (95% Platinum, 5% Other Metals)": 65, "Pt 900 (90% Platinum, 10% Other Metals)": 67, "Pt 850 (85% Platinum, 15% Other Metals)": 69, "Iridium-Platinum Alloys": 71, "Ruthenium-Platinum Alloys": 73
                    },
                    palladium: {
                        "Pd 500 (50% Palladium, 50% Silver)": 70, "Pd 950 (95% Palladium, 5% Other Metals)": 72, "Pd 999 (99.9% Pure Palladium)": 74, "Palladium-Silver Alloys": 76, "Palladium-Copper Alloys": 78
                    },
                    lead: {
                        "Pure Lead": 50, "Lead-Antimony Alloys": 52, "Lead-Tin Alloys": 54, "Lead-Calcium Alloys": 56, "Lead-Silver Alloys": 58
                    },
                    tin: {
                        "Pure Tin": 45, "Tin-Lead Alloys (Solder)": 47, "Tin-Silver Alloys": 49, "Tin-Copper Alloys (Bronze)": 51, "Tin-Zinc Alloys": 53
                    },
                    zirconium: {
                        "Zirconium 702 (Pure Zirconium)": 75, "Zirconium 704 (Zr-2.5Nb)": 77, "Zirconium 705 (Zr-3Al-2.5Nb)": 79, "Zircaloy-2 (Zr-Sn-Fe-Cr-Ni)": 81, "Zircaloy-4 (Zr-Sn-Fe-Cr)": 83
                    },
                    plastics: {
                        "Polyethylene (PE)": 600, "High-Density Polyethylene (HDPE)": 605, "Low-Density Polyethylene (LDPE)": 610, "Linear Low-Density Polyethylene (LLDPE)": 615,
                        "Polypropylene (PP)": 620, "Polyvinyl Chloride (PVC)": 625, "Polystyrene (PS)": 630, "High Impact Polystyrene (HIPS)": 635, "Expanded Polystyrene (EPS)": 640,
                        "Polyethylene Terephthalate (PET)": 645, "Polycarbonate (PC)": 650, "Acrylonitrile Butadiene Styrene (ABS)": 655, "Nylon (Polyamide, PA)": 660,
                        "Polytetrafluoroethylene (PTFE, Teflon)": 665, "Polyoxymethylene (POM, Acetal)": 670, "Polyethylene Chlorinated (CPE)": 675, "Polyurethane (PU)": 680,
                        "Polylactic Acid (PLA)": 685, "Polyethylene Naphthalate (PEN)": 690, "Polybutylene Terephthalate (PBT)": 695, "Polyetheretherketone (PEEK)": 700,
                        "Polyphenylene Oxide (PPO)": 705, "Polysulfone (PSU)": 710
                    },
                    glass: {
                        "Soda-Lime Glass": 200, "Borosilicate Glass": 205, "Lead Glass (Crystal)": 210, "Aluminosilicate Glass": 215, "Fused Silica Glass": 220,
                        "Chemically Strengthened Glass": 225, "Laminated Glass": 230, "Tempered Glass": 235, "Glass Ceramic": 240, "Optical Glass": 245
                    },
                    wood: {
                        "Hardwood": 250, "Oak": 255, "Maple": 260, "Cherry": 265, "Walnut": 270, "Mahogany": 275, "Teak": 280, "Birch": 285, "Ash": 290, "Beech": 295,
                        "Softwood": 300, "Pine": 305, "Cedar": 310, "Fir": 315, "Spruce": 320, "Redwood": 325, "Hemlock": 330,
                        "Engineered Wood": 335, "Plywood": 340, "Medium Density Fiberboard (MDF)": 345, "Particle Board": 350, "Oriented Strand Board (OSB)": 355, "Laminated Veneer Lumber (LVL)": 360, "Cross-Laminated Timber (CLT)": 365, "Glulam (Glued Laminated Timber)": 370
                    }
                },
                flatBottomDrill: {
                    aluminum: {
                        "1000 Series (Commercially Pure Aluminum)": 150, "1050": 155, "1060": 160, "1070": 165, "1100": 170,
                        "2000 Series (Aluminum-Copper Alloys)": 175, "2011": 180, "2014": 185, "2017": 190, "2024": 195,
                        "3000 Series (Aluminum-Manganese Alloys)": 200, "3003": 205, "3004": 210, "3105": 215, "3203": 220,
                        "4000 Series (Aluminum-Silicon Alloys)": 225, "4032": 230, "4043": 235, "4145": 240, "4643": 245,
                        "5000 Series (Aluminum-Magnesium Alloys)": 250, "5005": 255, "5052": 260, "5083": 265, "5086": 270, "5182": 275, "5251": 280, "5454": 285, "5657": 290,
                        "6000 Series (Aluminum-Magnesium-Silicon Alloys)": 295, "6005": 300, "6061": 305, "6063": 310, "6082": 315,
                        "7000 Series (Aluminum-Zinc Alloys)": 320, "7005": 325, "7050": 330, "7075": 335, "7475": 340,
                        "8000 Series (Other Elements)": 345, "8006": 350, "8111": 355, "8500": 360, "8510": 365, "8520": 370
                    },
                    brass: {
                        "C21000 (Gilding Metal)": 120, "C22000 (Commercial Bronze)": 125, "C23000 (Red Brass)": 130, "C24000 (Low Brass)": 135, "C26000 (Cartridge Brass)": 140, "C28000 (Muntz Metal)": 145, "C35300 (Leaded Brass)": 150, "C36000 (Free-Cutting Brass)": 155
                    },
                    bronze: {
                        "C22000 (Commercial Bronze)": 100, "C22600 (Red Brass)": 105, "C51000 (Phosphor Bronze)": 110, "C52100 (Phosphor Bronze)": 115, "C54400 (Phosphor Bronze)": 120, "C90300 (Tin Bronze)": 125, "C90500 (Tin Bronze)": 130, "C90700 (Tin Bronze)": 135, "C93200 (Bearing Bronze)": 140, "C95400 (Aluminum Bronze)": 145, "C95900 (Aluminum Bronze)": 150, "C86300 (Manganese Bronze)": 155
                    },
                    copper: {
                        "Pure Copper (C11000)": 140, "Oxygen-Free Copper (C10100)": 145, "Deoxidized High-Phosphorus Copper (C12200)": 150, "Electrolytic Tough Pitch (ETP) Copper (C11000)": 155, "Chromium Copper (C18200)": 160, "Beryllium Copper (C17200)": 165, "Nickel Silver (C74500)": 170, "Brass (C26000)": 175, "Phosphor Bronze (C51000)": 180, "Silicon Bronze (C65500)": 185
                    },
                    nickel: {
                        "Nickel 200": 125, "Nickel 201": 130, "Nickel 205": 135, "Nickel 270": 140, "Nickel 400 (Monel 400)": 145, "Nickel 404": 150, "Nickel 600 (Inconel 600)": 155, "Nickel 625 (Inconel 625)": 160, "Nickel 718 (Inconel 718)": 165, "Nickel K500 (Monel K500)": 170, "Nickel 800 (Incoloy 800)": 175, "Nickel 825 (Incoloy 825)": 180
                    },
                    carbonSteel: {
                        "Low Carbon Steel": 150, "1008 Steel": 155, "1010 Steel": 160, "1018 Steel": 165, "1020 Steel": 170,
                        "Medium Carbon Steel": 175, "1040 Steel": 180, "1045 Steel": 185, "1050 Steel": 190, "1060 Steel": 195,
                        "High Carbon Steel": 200, "1070 Steel": 205, "1080 Steel": 210, "1090 Steel": 215, "1095 Steel": 220,
                        "Ultra-High Carbon Steel": 225, "1100 Steel": 230, "1150 Steel": 235, "1200 Steel": 240
                    },
                    alloySteel: {
                        "4140 Alloy Steel": 140, "4340 Alloy Steel": 145, "4130 Alloy Steel": 150, "8620 Alloy Steel": 155, "9310 Alloy Steel": 160,
                        "6150 Alloy Steel": 165, "4340V Alloy Steel": 170, "52100 Alloy Steel": 175, "300M Alloy Steel": 180, "Maraging Steel (18Ni-300)": 185, "Maraging Steel (18Ni-250)": 190, "AISI 4145 Alloy Steel": 195
                    },
                    stainlessSteel: {
                        "Austenitic Stainless Steel": 130, "Ferritic Stainless Steel": 135, "Martensitic Stainless Steel": 140, "Duplex Stainless Steel": 145, "Precipitation-Hardening Stainless Steel": 150
                    },
                    toolSteel: {
                        "A2 Steel": 120, "D2 Steel": 125, "O1 Steel": 130, "M2 Steel": 135, "S7 Steel": 140, "H13 Steel": 145, "W1 Steel": 150
                    },
                    inconel: {
                        "Inconel 600": 100, "Inconel 601": 105, "Inconel 617": 110, "Inconel 625": 115, "Inconel 686": 120,
                        "Inconel 690": 125, "Inconel 693": 130, "Inconel 718": 135, "Inconel 725": 140, "Inconel 750": 145, "Inconel 751": 150, "Inconel 792": 155, "Inconel X-750": 160, "Inconel HX": 165, "Inconel 939": 170
                    },
                    titanium: {
                        "Grade 1 (Pure Titanium)": 130, "Grade 2 (Commercially Pure Titanium)": 135, "Grade 3 (Commercially Pure Titanium)": 140, "Grade 4 (Commercially Pure Titanium)": 145, "Grade 5 (Ti-6Al-4V)": 150,
                        "Grade 6 (Al-4V-2Sn)": 155, "Grade 7 (Ti-0.2Pd)": 160, "Grade 9 (Ti-3Al-2.5V)": 165, "Grade 12 (Ti-0.3Mo-0.8Ni)": 170, "Grade 23 (Ti-6Al-4V ELI)": 175
                    },
                    magnesium: {
                        "AZ31B": 120, "AZ61A": 125, "AZ80A": 130, "ZK60A": 135, "WE43": 140, "Elektron 21": 145, "Magnesium ZM21": 150
                    },
                    zinc: {
                        "Zamak 2": 180, "Zamak 3": 185, "Zamak 5": 190, "Zamak 7": 195, "ZA-8": 200, "ZA-12": 205, "ZA-27": 210, "Zinc 1100": 215, "Zinc 1600": 220, "Zinc 3900": 225
                    },
                    tungsten: {
                        "Pure Tungsten": 120, "Tungsten Carbide": 125, "Heavy Metal Alloys (W-Ni-Fe)": 130, "Heavy Metal Alloys (W-Ni-Cu)": 135, "Tungsten-Copper Alloys": 140,
                        "Tungsten-Rhenium Alloys": 145, "Tungsten-Thorium Alloys": 150, "Tungsten-Molybdenum Alloys": 155
                    },
                    molybdenum: {
                        "Pure Molybdenum": 130, "Molybdenum-Tungsten Alloys": 135, "Molybdenum-Lanthanum Alloys": 140, "TZM (Titanium-Zirconium-Molybdenum) Alloy": 145, "Molybdenum-Rhenium Alloys": 150
                    },
                    cobalt: {
                        "Cobalt 6B": 100, "Cobalt 6K": 105, "Cobalt L-605": 110, "Cobalt R-41": 115, "Cobalt FSX-414": 120, "Cobalt HS-188": 125, "Cobalt MAR-M-509": 130, "Cobalt MAR-M-918": 135
                    },
                    gold: {
                        "24K Gold (99.9% Pure)": 55, "22K Gold": 57, "18K Gold": 59, "14K Gold": 61, "10K Gold": 63, "White Gold": 65, "Rose Gold": 67, "Green Gold": 69
                    },
                    silver: {
                        "Fine Silver (99.9% Pure)": 70, "Sterling Silver (92.5% Silver, 7.5% Copper)": 72, "Argentium Silver (93.5% or 96% Silver)": 74, "Coin Silver (90% Silver, 10% Copper)": 76, "Britannia Silver (95.8% Silver)": 78
                    },
                    platinum: {
                        "Pt 950 (95% Platinum, 5% Other Metals)": 65, "Pt 900 (90% Platinum, 10% Other Metals)": 67, "Pt 850 (85% Platinum, 15% Other Metals)": 69, "Iridium-Platinum Alloys": 71, "Ruthenium-Platinum Alloys": 73
                    },
                    palladium: {
                        "Pd 500 (50% Palladium, 50% Silver)": 70, "Pd 950 (95% Palladium, 5% Other Metals)": 72, "Pd 999 (99.9% Pure Palladium)": 74, "Palladium-Silver Alloys": 76, "Palladium-Copper Alloys": 78
                    },
                    lead: {
                        "Pure Lead": 50, "Lead-Antimony Alloys": 52, "Lead-Tin Alloys": 54, "Lead-Calcium Alloys": 56, "Lead-Silver Alloys": 58
                    },
                    tin: {
                        "Pure Tin": 45, "Tin-Lead Alloys (Solder)": 47, "Tin-Silver Alloys": 49, "Tin-Copper Alloys (Bronze)": 51, "Tin-Zinc Alloys": 53
                    },
                    zirconium: {
                        "Zirconium 702 (Pure Zirconium)": 75, "Zirconium 704 (Zr-2.5Nb)": 77, "Zirconium 705 (Zr-3Al-2.5Nb)": 79, "Zircaloy-2 (Zr-Sn-Fe-Cr-Ni)": 81, "Zircaloy-4 (Zr-Sn-Fe-Cr)": 83
                    },
                    plastics: {
                        "Polyethylene (PE)": 400, "High-Density Polyethylene (HDPE)": 405, "Low-Density Polyethylene (LDPE)": 410, "Linear Low-Density Polyethylene (LLDPE)": 415,
                        "Polypropylene (PP)": 420, "Polyvinyl Chloride (PVC)": 425, "Polystyrene (PS)": 430, "High Impact Polystyrene (HIPS)": 435, "Expanded Polystyrene (EPS)": 440,
                        "Polyethylene Terephthalate (PET)": 445, "Polycarbonate (PC)": 450, "Acrylonitrile Butadiene Styrene (ABS)": 455, "Nylon (Polyamide, PA)": 460,
                        "Polytetrafluoroethylene (PTFE, Teflon)": 465, "Polyoxymethylene (POM, Acetal)": 470, "Polyethylene Chlorinated (CPE)": 475, "Polyurethane (PU)": 480,
                        "Polylactic Acid (PLA)": 485, "Polyethylene Naphthalate (PEN)": 490, "Polybutylene Terephthalate (PBT)": 495, "Polyetheretherketone (PEEK)": 500,
                        "Polyphenylene Oxide (PPO)": 505, "Polysulfone (PSU)": 510
                    },
                    glass: {
                        "Soda-Lime Glass": 200, "Borosilicate Glass": 205, "Lead Glass (Crystal)": 210, "Aluminosilicate Glass": 215, "Fused Silica Glass": 220,
                        "Chemically Strengthened Glass": 225, "Laminated Glass": 230, "Tempered Glass": 235, "Glass Ceramic": 240, "Optical Glass": 245
                    },
                    wood: {
                        "Hardwood": 250, "Oak": 255, "Maple": 260, "Cherry": 265, "Walnut": 270, "Mahogany": 275, "Teak": 280, "Birch": 285, "Ash": 290, "Beech": 295,
                        "Softwood": 300, "Pine": 305, "Cedar": 310, "Fir": 315, "Spruce": 320, "Redwood": 325, "Hemlock": 330,
                        "Engineered Wood": 335, "Plywood": 340, "Medium Density Fiberboard (MDF)": 345, "Particle Board": 350, "Oriented Strand Board (OSB)": 355, "Laminated Veneer Lumber (LVL)": 360, "Cross-Laminated Timber (CLT)": 365, "Glulam (Glued Laminated Timber)": 370
                    }
                },
                carbideMill: {
                    aluminum: {
                        "1000 Series (Commercially Pure Aluminum)": 400, "1050": 405, "1060": 410, "1070": 415, "1100": 420,
                        "2000 Series (Aluminum-Copper Alloys)": 425, "2011": 430, "2014": 435, "2017": 440, "2024": 445,
                        "3000 Series (Aluminum-Manganese Alloys)": 450, "3003": 455, "3004": 460, "3105": 465, "3203": 470,
                        "4000 Series (Aluminum-Silicon Alloys)": 475, "4032": 480, "4043": 485, "4145": 490, "4643": 495,
                        "5000 Series (Aluminum-Magnesium Alloys)": 500, "5005": 505, "5052": 510, "5083": 515, "5086": 520, "5182": 525, "5251": 530, "5454": 535, "5657": 540,
                        "6000 Series (Aluminum-Magnesium-Silicon Alloys)": 545, "6005": 550, "6061": 555, "6063": 560, "6082": 565,
                        "7000 Series (Aluminum-Zinc Alloys)": 570, "7005": 575, "7050": 580, "7075": 585, "7475": 590,
                        "8000 Series (Other Elements)": 595, "8006": 600, "8111": 605, "8500": 610, "8510": 615, "8520": 620
                    },
                    brass: {
                        "C21000 (Gilding Metal)": 300, "C22000 (Commercial Bronze)": 305, "C23000 (Red Brass)": 310, "C24000 (Low Brass)": 315, "C26000 (Cartridge Brass)": 320, "C28000 (Muntz Metal)": 325, "C35300 (Leaded Brass)": 330, "C36000 (Free-Cutting Brass)": 335
                    },
                    bronze: {
                        "C22000 (Commercial Bronze)": 250, "C22600 (Red Brass)": 255, "C51000 (Phosphor Bronze)": 260, "C52100 (Phosphor Bronze)": 265, "C54400 (Phosphor Bronze)": 270, "C90300 (Tin Bronze)": 275, "C90500 (Tin Bronze)": 280, "C90700 (Tin Bronze)": 285, "C93200 (Bearing Bronze)": 290, "C95400 (Aluminum Bronze)": 295, "C95900 (Aluminum Bronze)": 300, "C86300 (Manganese Bronze)": 305
                    },
                    copper: {
                        "Pure Copper (C11000)": 260, "Oxygen-Free Copper (C10100)": 265, "Deoxidized High-Phosphorus Copper (C12200)": 270, "Electrolytic Tough Pitch (ETP) Copper (C11000)": 275, "Chromium Copper (C18200)": 280, "Beryllium Copper (C17200)": 285, "Nickel Silver (C74500)": 290, "Brass (C26000)": 295, "Phosphor Bronze (C51000)": 300, "Silicon Bronze (C65500)": 305
                    },
                    nickel: {
                        "Nickel 200": 225, "Nickel 201": 230, "Nickel 205": 235, "Nickel 270": 240, "Nickel 400 (Monel 400)": 245, "Nickel 404": 250, "Nickel 600 (Inconel 600)": 255, "Nickel 625 (Inconel 625)": 260, "Nickel 718 (Inconel 718)": 265, "Nickel K500 (Monel K500)": 270, "Nickel 800 (Incoloy 800)": 275, "Nickel 825 (Incoloy 825)": 280
                    },
                    carbonSteel: {
                        "Low Carbon Steel": 260, "1008 Steel": 265, "1010 Steel": 270, "1018 Steel": 275, "1020 Steel": 280,
                        "Medium Carbon Steel": 285, "1040 Steel": 290, "1045 Steel": 295, "1050 Steel": 300, "1060 Steel": 305,
                        "High Carbon Steel": 310, "1070 Steel": 315, "1080 Steel": 320, "1090 Steel": 325, "1095 Steel": 330,
                        "Ultra-High Carbon Steel": 335, "1100 Steel": 340, "1150 Steel": 345, "1200 Steel": 350
                    },
                    alloySteel: {
                        "4140 Alloy Steel": 235, "4340 Alloy Steel": 240, "4130 Alloy Steel": 245, "8620 Alloy Steel": 250, "9310 Alloy Steel": 255,
                        "6150 Alloy Steel": 260, "4340V Alloy Steel": 265, "52100 Alloy Steel": 270, "300M Alloy Steel": 275, "Maraging Steel (18Ni-300)": 280, "Maraging Steel (18Ni-250)": 285, "AISI 4145 Alloy Steel": 290
                    },
                    stainlessSteel: {
                        "Austenitic Stainless Steel": 220, "Ferritic Stainless Steel": 225, "Martensitic Stainless Steel": 230, "Duplex Stainless Steel": 235, "Precipitation-Hardening Stainless Steel": 240
                    },
                    toolSteel: {
                        "A2 Steel": 210, "D2 Steel": 215, "O1 Steel": 220, "M2 Steel": 225, "S7 Steel": 230, "H13 Steel": 235, "W1 Steel": 240
                    },
                    inconel: {
                        "Inconel 600": 200, "Inconel 601": 205, "Inconel 617": 210, "Inconel 625": 215, "Inconel 686": 220,
                        "Inconel 690": 225, "Inconel 693": 230, "Inconel 718": 235, "Inconel 725": 240, "Inconel 750": 245, "Inconel 751": 250, "Inconel 792": 255, "Inconel X-750": 260, "Inconel HX": 265, "Inconel 939": 270
                    },
                    titanium: {
                        "Grade 1 (Pure Titanium)": 230, "Grade 2 (Commercially Pure Titanium)": 235, "Grade 3 (Commercially Pure Titanium)": 240, "Grade 4 (Commercially Pure Titanium)": 245, "Grade 5 (Ti-6Al-4V)": 250,
                        "Grade 6 (Al-4V-2Sn)": 255, "Grade 7 (Ti-0.2Pd)": 260, "Grade 9 (Ti-3Al-2.5V)": 265, "Grade 12 (Ti-0.3Mo-0.8Ni)": 270, "Grade 23 (Ti-6Al-4V ELI)": 275
                    },
                    magnesium: {
                        "AZ31B": 210, "AZ61A": 215, "AZ80A": 220, "ZK60A": 225, "WE43": 230, "Elektron 21": 235, "Magnesium ZM21": 240
                    },
                    zinc: {
                        "Zamak 2": 300, "Zamak 3": 305, "Zamak 5": 310, "Zamak 7": 315, "ZA-8": 320, "ZA-12": 325, "ZA-27": 330, "Zinc 1100": 335, "Zinc 1600": 340, "Zinc 3900": 345
                    },
                    tungsten: {
                        "Pure Tungsten": 180, "Tungsten Carbide": 185, "Heavy Metal Alloys (W-Ni-Fe)": 190, "Heavy Metal Alloys (W-Ni-Cu)": 195, "Tungsten-Copper Alloys": 200,
                        "Tungsten-Rhenium Alloys": 205, "Tungsten-Thorium Alloys": 210, "Tungsten-Molybdenum Alloys": 215
                    },
                    molybdenum: {
                        "Pure Molybdenum": 200, "Molybdenum-Tungsten Alloys": 205, "Molybdenum-Lanthanum Alloys": 210, "TZM (Titanium-Zirconium-Molybdenum) Alloy": 215, "Molybdenum-Rhenium Alloys": 220
                    },
                    cobalt: {
                        "Cobalt 6B": 190, "Cobalt 6K": 195, "Cobalt L-605": 200, "Cobalt R-41": 205, "Cobalt FSX-414": 210, "Cobalt HS-188": 215, "Cobalt MAR-M-509": 220, "Cobalt MAR-M-918": 225
                    },
                    gold: {
                        "24K Gold (99.9% Pure)": 115, "22K Gold": 117, "18K Gold": 119, "14K Gold": 121, "10K Gold": 123, "White Gold": 125, "Rose Gold": 127, "Green Gold": 129
                    },
                    silver: {
                        "Fine Silver (99.9% Pure)": 140, "Sterling Silver (92.5% Silver, 7.5% Copper)": 142, "Argentium Silver (93.5% or 96% Silver)": 144, "Coin Silver (90% Silver, 10% Copper)": 146, "Britannia Silver (95.8% Silver)": 148
                    },
                    platinum: {
                        "Pt 950 (95% Platinum, 5% Other Metals)": 125, "Pt 900 (90% Platinum, 10% Other Metals)": 127, "Pt 850 (85% Platinum, 15% Other Metals)": 129, "Iridium-Platinum Alloys": 131, "Ruthenium-Platinum Alloys": 133
                    },
                    palladium: {
                        "Pd 500 (50% Palladium, 50% Silver)": 130, "Pd 950 (95% Palladium, 5% Other Metals)": 132, "Pd 999 (99.9% Pure Palladium)": 134, "Palladium-Silver Alloys": 136, "Palladium-Copper Alloys": 138
                    },
                    lead: {
                        "Pure Lead": 70, "Lead-Antimony Alloys": 72, "Lead-Tin Alloys": 74, "Lead-Calcium Alloys": 76, "Lead-Silver Alloys": 78
                    },
                    tin: {
                        "Pure Tin": 65, "Tin-Lead Alloys (Solder)": 67, "Tin-Silver Alloys": 69, "Tin-Copper Alloys (Bronze)": 71, "Tin-Zinc Alloys": 73
                    },
                    zirconium: {
                        "Zirconium 702 (Pure Zirconium)": 180, "Zirconium 704 (Zr-2.5Nb)": 185, "Zirconium 705 (Zr-3Al-2.5Nb)": 190, "Zircaloy-2 (Zr-Sn-Fe-Cr-Ni)": 195, "Zircaloy-4 (Zr-Sn-Fe-Cr)": 200
                    },
                    plastics: {
                        "Polyethylene (PE)": 1200, "High-Density Polyethylene (HDPE)": 1205, "Low-Density Polyethylene (LDPE)": 1210, "Linear Low-Density Polyethylene (LLDPE)": 1215,
                        "Polypropylene (PP)": 1220, "Polyvinyl Chloride (PVC)": 1225, "Polystyrene (PS)": 1230, "High Impact Polystyrene (HIPS)": 1235, "Expanded Polystyrene (EPS)": 1240,
                        "Polyethylene Terephthalate (PET)": 1245, "Polycarbonate (PC)": 1250, "Acrylonitrile Butadiene Styrene (ABS)": 1255, "Nylon (Polyamide, PA)": 1260,
                        "Polytetrafluoroethylene (PTFE, Teflon)": 1265, "Polyoxymethylene (POM, Acetal)": 1270, "Polyethylene Chlorinated (CPE)": 1275, "Polyurethane (PU)": 1280,
                        "Polylactic Acid (PLA)": 1285, "Polyethylene Naphthalate (PEN)": 1290, "Polybutylene Terephthalate (PBT)": 1295, "Polyetheretherketone (PEEK)": 1300,
                        "Polyphenylene Oxide (PPO)": 1305, "Polysulfone (PSU)": 1310
                    },
                    glass: {
                        "Soda-Lime Glass": 220, "Borosilicate Glass": 225, "Lead Glass (Crystal)": 230, "Aluminosilicate Glass": 235, "Fused Silica Glass": 240,
                        "Chemically Strengthened Glass": 245, "Laminated Glass": 250, "Tempered Glass": 255, "Glass Ceramic": 260, "Optical Glass": 265
                    },
                    wood: {
                        "Hardwood": 350, "Oak": 355, "Maple": 360, "Cherry": 365, "Walnut": 370, "Mahogany": 375, "Teak": 380, "Birch": 385, "Ash": 390, "Beech": 395,
                        "Softwood": 400, "Pine": 405, "Cedar": 410, "Fir": 415, "Spruce": 420, "Redwood": 425, "Hemlock": 430,
                        "Engineered Wood": 435, "Plywood": 440, "Medium Density Fiberboard (MDF)": 445, "Particle Board": 450, "Oriented Strand Board (OSB)": 455, "Laminated Veneer Lumber (LVL)": 460, "Cross-Laminated Timber (CLT)": 465, "Glulam (Glued Laminated Timber)": 470
                    }
                },
                reamer: {
                    aluminum: {
                        "1000 Series (Commercially Pure Aluminum)": 150, "1050": 155, "1060": 160, "1070": 165, "1100": 170,
                        "2000 Series (Aluminum-Copper Alloys)": 175, "2011": 180, "2014": 185, "2017": 190, "2024": 195,
                        "3000 Series (Aluminum-Manganese Alloys)": 200, "3003": 205, "3004": 210, "3105": 215, "3203": 220,
                        "4000 Series (Aluminum-Silicon Alloys)": 225, "4032": 230, "4043": 235, "4145": 240, "4643": 245,
                        "5000 Series (Aluminum-Magnesium Alloys)": 250, "5005": 255, "5052": 260, "5083": 265, "5086": 270, "5182": 275, "5251": 280, "5454": 285, "5657": 290,
                        "6000 Series (Aluminum-Magnesium-Silicon Alloys)": 295, "6005": 300, "6061": 305, "6063": 310, "6082": 315,
                        "7000 Series (Aluminum-Zinc Alloys)": 320, "7005": 325, "7050": 330, "7075": 335, "7475": 340,
                        "8000 Series (Other Elements)": 345, "8006": 350, "8111": 355, "8500": 360, "8510": 365, "8520": 370
                    },
                    brass: {
                        "C21000 (Gilding Metal)": 120, "C22000 (Commercial Bronze)": 125, "C23000 (Red Brass)": 130, "C24000 (Low Brass)": 135, "C26000 (Cartridge Brass)": 140, "C28000 (Muntz Metal)": 145, "C35300 (Leaded Brass)": 150, "C36000 (Free-Cutting Brass)": 155
                    },
                    bronze: {
                        "C22000 (Commercial Bronze)": 100, "C22600 (Red Brass)": 105, "C51000 (Phosphor Bronze)": 110, "C52100 (Phosphor Bronze)": 115, "C54400 (Phosphor Bronze)": 120, "C90300 (Tin Bronze)": 125, "C90500 (Tin Bronze)": 130, "C90700 (Tin Bronze)": 135, "C93200 (Bearing Bronze)": 140, "C95400 (Aluminum Bronze)": 145, "C95900 (Aluminum Bronze)": 150, "C86300 (Manganese Bronze)": 155
                    },
                    copper: {
                        "Pure Copper (C11000)": 140, "Oxygen-Free Copper (C10100)": 145, "Deoxidized High-Phosphorus Copper (C12200)": 150, "Electrolytic Tough Pitch (ETP) Copper (C11000)": 155, "Chromium Copper (C18200)": 160, "Beryllium Copper (C17200)": 165, "Nickel Silver (C74500)": 170, "Brass (C26000)": 175, "Phosphor Bronze (C51000)": 180, "Silicon Bronze (C65500)": 185
                    },
                    nickel: {
                        "Nickel 200": 125, "Nickel 201": 130, "Nickel 205": 135, "Nickel 270": 140, "Nickel 400 (Monel 400)": 145, "Nickel 404": 150, "Nickel 600 (Inconel 600)": 155, "Nickel 625 (Inconel 625)": 160, "Nickel 718 (Inconel 718)": 165, "Nickel K500 (Monel K500)": 170, "Nickel 800 (Incoloy 800)": 175, "Nickel 825 (Incoloy 825)": 180
                    },
                    carbonSteel: {
                        "Low Carbon Steel": 150, "1008 Steel": 155, "1010 Steel": 160, "1018 Steel": 165, "1020 Steel": 170,
                        "Medium Carbon Steel": 175, "1040 Steel": 180, "1045 Steel": 185, "1050 Steel": 190, "1060 Steel": 195,
                        "High Carbon Steel": 200, "1070 Steel": 205, "1080 Steel": 210, "1090 Steel": 215, "1095 Steel": 220,
                        "Ultra-High Carbon Steel": 225, "1100 Steel": 230, "1150 Steel": 235, "1200 Steel": 240
                    },
                    alloySteel: {
                        "4140 Alloy Steel": 140, "4340 Alloy Steel": 145, "4130 Alloy Steel": 150, "8620 Alloy Steel": 155, "9310 Alloy Steel": 160,
                        "6150 Alloy Steel": 165, "4340V Alloy Steel": 170, "52100 Alloy Steel": 175, "300M Alloy Steel": 180, "Maraging Steel (18Ni-300)": 185, "Maraging Steel (18Ni-250)": 190, "AISI 4145 Alloy Steel": 195
                    },
                    stainlessSteel: {
                        "Austenitic Stainless Steel": 130, "Ferritic Stainless Steel": 135, "Martensitic Stainless Steel": 140, "Duplex Stainless Steel": 145, "Precipitation-Hardening Stainless Steel": 150
                    },
                    toolSteel: {
                        "A2 Steel": 120, "D2 Steel": 125, "O1 Steel": 130, "M2 Steel": 135, "S7 Steel": 140, "H13 Steel": 145, "W1 Steel": 150
                    },
                    inconel: {
                        "Inconel 600": 100, "Inconel 601": 105, "Inconel 617": 110, "Inconel 625": 115, "Inconel 686": 120,
                        "Inconel 690": 125, "Inconel 693": 130, "Inconel 718": 135, "Inconel 725": 140, "Inconel 750": 145, "Inconel 751": 150, "Inconel 792": 155, "Inconel X-750": 160, "Inconel HX": 165, "Inconel 939": 170
                    },
                    titanium: {
                        "Grade 1 (Pure Titanium)": 130, "Grade 2 (Commercially Pure Titanium)": 135, "Grade 3 (Commercially Pure Titanium)": 140, "Grade 4 (Commercially Pure Titanium)": 145, "Grade 5 (Ti-6Al-4V)": 150,
                        "Grade 6 (Al-4V-2Sn)": 155, "Grade 7 (Ti-0.2Pd)": 160, "Grade 9 (Ti-3Al-2.5V)": 165, "Grade 12 (Ti-0.3Mo-0.8Ni)": 170, "Grade 23 (Ti-6Al-4V ELI)": 175
                    },
                    magnesium: {
                        "AZ31B": 120, "AZ61A": 125, "AZ80A": 130, "ZK60A": 135, "WE43": 140, "Elektron 21": 145, "Magnesium ZM21": 150
                    },
                    zinc: {
                        "Zamak 2": 180, "Zamak 3": 185, "Zamak 5": 190, "Zamak 7": 195, "ZA-8": 200, "ZA-12": 205, "ZA-27": 210, "Zinc 1100": 215, "Zinc 1600": 220, "Zinc 3900": 225
                    },
                    tungsten: {
                        "Pure Tungsten": 120, "Tungsten Carbide": 125, "Heavy Metal Alloys (W-Ni-Fe)": 130, "Heavy Metal Alloys (W-Ni-Cu)": 135, "Tungsten-Copper Alloys": 140,
                        "Tungsten-Rhenium Alloys": 145, "Tungsten-Thorium Alloys": 150, "Tungsten-Molybdenum Alloys": 155
                    },
                    molybdenum: {
                        "Pure Molybdenum": 130, "Molybdenum-Tungsten Alloys": 135, "Molybdenum-Lanthanum Alloys": 140, "TZM (Titanium-Zirconium-Molybdenum) Alloy": 145, "Molybdenum-Rhenium Alloys": 150
                    },
                    cobalt: {
                        "Cobalt 6B": 100, "Cobalt 6K": 105, "Cobalt L-605": 110, "Cobalt R-41": 115, "Cobalt FSX-414": 120, "Cobalt HS-188": 125, "Cobalt MAR-M-509": 130, "Cobalt MAR-M-918": 135
                    },
                    gold: {
                        "24K Gold (99.9% Pure)": 55, "22K Gold": 57, "18K Gold": 59, "14K Gold": 61, "10K Gold": 63, "White Gold": 65, "Rose Gold": 67, "Green Gold": 69
                    },
                    silver: {
                        "Fine Silver (99.9% Pure)": 70, "Sterling Silver (92.5% Silver, 7.5% Copper)": 72, "Argentium Silver (93.5% or 96% Silver)": 74, "Coin Silver (90% Silver, 10% Copper)": 76, "Britannia Silver (95.8% Silver)": 78
                    },
                    platinum: {
                        "Pt 950 (95% Platinum, 5% Other Metals)": 65, "Pt 900 (90% Platinum, 10% Other Metals)": 67, "Pt 850 (85% Platinum, 15% Other Metals)": 69, "Iridium-Platinum Alloys": 71, "Ruthenium-Platinum Alloys": 73
                    },
                    palladium: {
                        "Pd 500 (50% Palladium, 50% Silver)": 70, "Pd 950 (95% Palladium, 5% Other Metals)": 72, "Pd 999 (99.9% Pure Palladium)": 74, "Palladium-Silver Alloys": 76, "Palladium-Copper Alloys": 78
                    },
                    lead: {
                        "Pure Lead": 50, "Lead-Antimony Alloys": 52, "Lead-Tin Alloys": 54, "Lead-Calcium Alloys": 56, "Lead-Silver Alloys": 58
                    },
                    tin: {
                        "Pure Tin": 45, "Tin-Lead Alloys (Solder)": 47, "Tin-Silver Alloys": 49, "Tin-Copper Alloys (Bronze)": 51, "Tin-Zinc Alloys": 53
                    },
                    zirconium: {
                        "Zirconium 702 (Pure Zirconium)": 75, "Zirconium 704 (Zr-2.5Nb)": 77, "Zirconium 705 (Zr-3Al-2.5Nb)": 79, "Zircaloy-2 (Zr-Sn-Fe-Cr-Ni)": 81, "Zircaloy-4 (Zr-Sn-Fe-Cr)": 83
                    },
                    plastics: {
                        "Polyethylene (PE)": 400, "High-Density Polyethylene (HDPE)": 405, "Low-Density Polyethylene (LDPE)": 410, "Linear Low-Density Polyethylene (LLDPE)": 415,
                        "Polypropylene (PP)": 420, "Polyvinyl Chloride (PVC)": 425, "Polystyrene (PS)": 430, "High Impact Polystyrene (HIPS)": 435, "Expanded Polystyrene (EPS)": 440,
                        "Polyethylene Terephthalate (PET)": 445, "Polycarbonate (PC)": 450, "Acrylonitrile Butadiene Styrene (ABS)": 455, "Nylon (Polyamide, PA)": 460,
                        "Polytetrafluoroethylene (PTFE, Teflon)": 465, "Polyoxymethylene (POM, Acetal)": 470, "Polyethylene Chlorinated (CPE)": 475, "Polyurethane (PU)": 480,
                        "Polylactic Acid (PLA)": 485, "Polyethylene Naphthalate (PEN)": 490, "Polybutylene Terephthalate (PBT)": 495, "Polyetheretherketone (PEEK)": 500,
                        "Polyphenylene Oxide (PPO)": 505, "Polysulfone (PSU)": 510
                    },
                    glass: {
                        "Soda-Lime Glass": 200, "Borosilicate Glass": 205, "Lead Glass (Crystal)": 210, "Aluminosilicate Glass": 215, "Fused Silica Glass": 220,
                        "Chemically Strengthened Glass": 225, "Laminated Glass": 230, "Tempered Glass": 235, "Glass Ceramic": 240, "Optical Glass": 245
                    },
                    wood: {
                        "Hardwood": 250, "Oak": 255, "Maple": 260, "Cherry": 265, "Walnut": 270, "Mahogany": 275, "Teak": 280, "Birch": 285, "Ash": 290, "Beech": 295,
                        "Softwood": 300, "Pine": 305, "Cedar": 310, "Fir": 315, "Spruce": 320, "Redwood": 325, "Hemlock": 330,
                        "Engineered Wood": 335, "Plywood": 340, "Medium Density Fiberboard (MDF)": 345, "Particle Board": 350, "Oriented Strand Board (OSB)": 355, "Laminated Veneer Lumber (LVL)": 360, "Cross-Laminated Timber (CLT)": 365, "Glulam (Glued Laminated Timber)": 370
                    }
                },
                coldFormTap: {
                    aluminum: {
                        "1000 Series (Commercially Pure Aluminum)": 200, "1050": 205, "1060": 210, "1070": 215, "1100": 220,
                        "2000 Series (Aluminum-Copper Alloys)": 225, "2011": 230, "2014": 235, "2017": 240, "2024": 245,
                        "3000 Series (Aluminum-Manganese Alloys)": 250, "3003": 255, "3004": 260, "3105": 265, "3203": 270,
                        "4000 Series (Aluminum-Silicon Alloys)": 275, "4032": 280, "4043": 285, "4145": 290, "4643": 295,
                        "5000 Series (Aluminum-Magnesium Alloys)": 300, "5005": 305, "5052": 310, "5083": 315, "5086": 320, "5182": 325, "5251": 330, "5454": 335, "5657": 340,
                        "6000 Series (Aluminum-Magnesium-Silicon Alloys)": 345, "6005": 350, "6061": 355, "6063": 360, "6082": 365,
                        "7000 Series (Aluminum-Zinc Alloys)": 370, "7005": 375, "7050": 380, "7075": 385, "7475": 390,
                        "8000 Series (Other Elements)": 395, "8006": 400, "8111": 405, "8500": 410, "8510": 415, "8520": 420
                    },
                    brass: {
                        "C21000 (Gilding Metal)": 150, "C22000 (Commercial Bronze)": 155, "C23000 (Red Brass)": 160, "C24000 (Low Brass)": 165, "C26000 (Cartridge Brass)": 170, "C28000 (Muntz Metal)": 175, "C35300 (Leaded Brass)": 180, "C36000 (Free-Cutting Brass)": 185
                    },
                    bronze: {
                        "C22000 (Commercial Bronze)": 100, "C22600 (Red Brass)": 105, "C51000 (Phosphor Bronze)": 110, "C52100 (Phosphor Bronze)": 115, "C54400 (Phosphor Bronze)": 120, "C90300 (Tin Bronze)": 125, "C90500 (Tin Bronze)": 130, "C90700 (Tin Bronze)": 135, "C93200 (Bearing Bronze)": 140, "C95400 (Aluminum Bronze)": 145, "C95900 (Aluminum Bronze)": 150, "C86300 (Manganese Bronze)": 155
                    },
                    copper: {
                        "Pure Copper (C11000)": 120, "Oxygen-Free Copper (C10100)": 125, "Deoxidized High-Phosphorus Copper (C12200)": 130, "Electrolytic Tough Pitch (ETP) Copper (C11000)": 135, "Chromium Copper (C18200)": 140, "Beryllium Copper (C17200)": 145, "Nickel Silver (C74500)": 150, "Brass (C26000)": 155, "Phosphor Bronze (C51000)": 160, "Silicon Bronze (C65500)": 165
                    },
                    nickel: {
                        "Nickel 200": 95, "Nickel 201": 100, "Nickel 205": 105, "Nickel 270": 110, "Nickel 400 (Monel 400)": 115, "Nickel 404": 120, "Nickel 600 (Inconel 600)": 125, "Nickel 625 (Inconel 625)": 130, "Nickel 718 (Inconel 718)": 135, "Nickel K500 (Monel K500)": 140, "Nickel 800 (Incoloy 800)": 145, "Nickel 825 (Incoloy 825)": 150
                    },
                    carbonSteel: {
                        "Low Carbon Steel": 110, "1008 Steel": 115, "1010 Steel": 120, "1018 Steel": 125, "1020 Steel": 130,
                        "Medium Carbon Steel": 135, "1040 Steel": 140, "1045 Steel": 145, "1050 Steel": 150, "1060 Steel": 155,
                        "High Carbon Steel": 160, "1070 Steel": 165, "1080 Steel": 170, "1090 Steel": 175, "1095 Steel": 180,
                        "Ultra-High Carbon Steel": 185, "1100 Steel": 190, "1150 Steel": 195, "1200 Steel": 200
                    },
                    alloySteel: {
                        "4140 Alloy Steel": 100, "4340 Alloy Steel": 105, "4130 Alloy Steel": 110, "8620 Alloy Steel": 115, "9310 Alloy Steel": 120,
                        "6150 Alloy Steel": 125, "4340V Alloy Steel": 130, "52100 Alloy Steel": 135, "300M Alloy Steel": 140, "Maraging Steel (18Ni-300)": 145, "Maraging Steel (18Ni-250)": 150, "AISI 4145 Alloy Steel": 155
                    },
                    stainlessSteel: {
                        "Austenitic Stainless Steel": 90, "Ferritic Stainless Steel": 95, "Martensitic Stainless Steel": 100, "Duplex Stainless Steel": 105, "Precipitation-Hardening Stainless Steel": 110
                    },
                    toolSteel: {
                        "A2 Steel": 85, "D2 Steel": 90, "O1 Steel": 95, "M2 Steel": 100, "S7 Steel": 105, "H13 Steel": 110, "W1 Steel": 115
                    },
                    inconel: {
                        "Inconel 600": 80, "Inconel 601": 85, "Inconel 617": 90, "Inconel 625": 95, "Inconel 686": 100,
                        "Inconel 690": 105, "Inconel 693": 110, "Inconel 718": 115, "Inconel 725": 120, "Inconel 750": 125, "Inconel 751": 130, "Inconel 792": 135, "Inconel X-750": 140, "Inconel HX": 145, "Inconel 939": 150
                    },
                    titanium: {
                        "Grade 1 (Pure Titanium)": 110, "Grade 2 (Commercially Pure Titanium)": 115, "Grade 3 (Commercially Pure Titanium)": 120, "Grade 4 (Commercially Pure Titanium)": 125, "Grade 5 (Ti-6Al-4V)": 130,
                        "Grade 6 (Al-4V-2Sn)": 135, "Grade 7 (Ti-0.2Pd)": 140, "Grade 9 (Ti-3Al-2.5V)": 145, "Grade 12 (Ti-0.3Mo-0.8Ni)": 150, "Grade 23 (Ti-6Al-4V ELI)": 155
                    },
                    magnesium: {
                        "AZ31B": 100, "AZ61A": 105, "AZ80A": 110, "ZK60A": 115, "WE43": 120, "Elektron 21": 125, "Magnesium ZM21": 130
                    },
                    zinc: {
                        "Zamak 2": 150, "Zamak 3": 155, "Zamak 5": 160, "Zamak 7": 165, "ZA-8": 170, "ZA-12": 175, "ZA-27": 180, "Zinc 1100": 185, "Zinc 1600": 190, "Zinc 3900": 195
                    },
                    tungsten: {
                        "Pure Tungsten": 70, "Tungsten Carbide": 75, "Heavy Metal Alloys (W-Ni-Fe)": 80, "Heavy Metal Alloys (W-Ni-Cu)": 85, "Tungsten-Copper Alloys": 90,
                        "Tungsten-Rhenium Alloys": 95, "Tungsten-Thorium Alloys": 100, "Tungsten-Molybdenum Alloys": 105
                    },
                    molybdenum: {
                        "Pure Molybdenum": 90, "Molybdenum-Tungsten Alloys": 95, "Molybdenum-Lanthanum Alloys": 100, "TZM (Titanium-Zirconium-Molybdenum) Alloy": 105, "Molybdenum-Rhenium Alloys": 110
                    },
                    cobalt: {
                        "Cobalt 6B": 100, "Cobalt 6K": 105, "Cobalt L-605": 110, "Cobalt R-41": 115, "Cobalt FSX-414": 120, "Cobalt HS-188": 125, "Cobalt MAR-M-509": 130, "Cobalt MAR-M-918": 135
                    },
                    gold: {
                        "24K Gold (99.9% Pure)": 55, "22K Gold": 57, "18K Gold": 59, "14K Gold": 61, "10K Gold": 63, "White Gold": 65, "Rose Gold": 67, "Green Gold": 69
                    },
                    silver: {
                        "Fine Silver (99.9% Pure)": 70, "Sterling Silver (92.5% Silver, 7.5% Copper)": 72, "Argentium Silver (93.5% or 96% Silver)": 74, "Coin Silver (90% Silver, 10% Copper)": 76, "Britannia Silver (95.8% Silver)": 78
                    },
                    platinum: {
                        "Pt 950 (95% Platinum, 5% Other Metals)": 65, "Pt 900 (90% Platinum, 10% Other Metals)": 67, "Pt 850 (85% Platinum, 15% Other Metals)": 69, "Iridium-Platinum Alloys": 71, "Ruthenium-Platinum Alloys": 73
                    },
                    palladium: {
                        "Pd 500 (50% Palladium, 50% Silver)": 70, "Pd 950 (95% Palladium, 5% Other Metals)": 72, "Pd 999 (99.9% Pure Palladium)": 74, "Palladium-Silver Alloys": 76, "Palladium-Copper Alloys": 78
                    },
                    lead: {
                        "Pure Lead": 50, "Lead-Antimony Alloys": 52, "Lead-Tin Alloys": 54, "Lead-Calcium Alloys": 56, "Lead-Silver Alloys": 58
                    },
                    tin: {
                        "Pure Tin": 45, "Tin-Lead Alloys (Solder)": 47, "Tin-Silver Alloys": 49, "Tin-Copper Alloys (Bronze)": 51, "Tin-Zinc Alloys": 53
                    },
                    zirconium: {
                        "Zirconium 702 (Pure Zirconium)": 75, "Zirconium 704 (Zr-2.5Nb)": 77, "Zirconium 705 (Zr-3Al-2.5Nb)": 79, "Zircaloy-2 (Zr-Sn-Fe-Cr-Ni)": 81, "Zircaloy-4 (Zr-Sn-Fe-Cr)": 83
                    },
                    plastics: {
                        "Polyethylene (PE)": 600, "High-Density Polyethylene (HDPE)": 605, "Low-Density Polyethylene (LDPE)": 610, "Linear Low-Density Polyethylene (LLDPE)": 615,
                        "Polypropylene (PP)": 620, "Polyvinyl Chloride (PVC)": 625, "Polystyrene (PS)": 630, "High Impact Polystyrene (HIPS)": 635, "Expanded Polystyrene (EPS)": 640,
                        "Polyethylene Terephthalate (PET)": 645, "Polycarbonate (PC)": 650, "Acrylonitrile Butadiene Styrene (ABS)": 655, "Nylon (Polyamide, PA)": 660,
                        "Polytetrafluoroethylene (PTFE, Teflon)": 665, "Polyoxymethylene (POM, Acetal)": 670, "Polyethylene Chlorinated (CPE)": 675, "Polyurethane (PU)": 680,
                        "Polylactic Acid (PLA)": 685, "Polyethylene Naphthalate (PEN)": 690, "Polybutylene Terephthalate (PBT)": 695, "Polyetheretherketone (PEEK)": 700,
                        "Polyphenylene Oxide (PPO)": 705, "Polysulfone (PSU)": 710
                    },
                    glass: {
                        "Soda-Lime Glass": 200, "Borosilicate Glass": 205, "Lead Glass (Crystal)": 210, "Aluminosilicate Glass": 215, "Fused Silica Glass": 220,
                        "Chemically Strengthened Glass": 225, "Laminated Glass": 230, "Tempered Glass": 235, "Glass Ceramic": 240, "Optical Glass": 245
                    },
                    wood: {
                        "Hardwood": 250, "Oak": 255, "Maple": 260, "Cherry": 265, "Walnut": 270, "Mahogany": 275, "Teak": 280, "Birch": 285, "Ash": 290, "Beech": 295,
                        "Softwood": 300, "Pine": 305, "Cedar": 310, "Fir": 315, "Spruce": 320, "Redwood": 325, "Hemlock": 330,
                        "Engineered Wood": 335, "Plywood": 340, "Medium Density Fiberboard (MDF)": 345, "Particle Board": 350, "Oriented Strand Board (OSB)": 355, "Laminated Veneer Lumber (LVL)": 360, "Cross-Laminated Timber (CLT)": 365, "Glulam (Glued Laminated Timber)": 370
                    }
                },
                spiralLockTaps: {
                    aluminum: {
                        "1000 Series (Commercially Pure Aluminum)": 180, "1050": 185, "1060": 190, "1070": 195, "1100": 200,
                        "2000 Series (Aluminum-Copper Alloys)": 205, "2011": 210, "2014": 215, "2017": 220, "2024": 225,
                        "3000 Series (Aluminum-Manganese Alloys)": 230, "3003": 235, "3004": 240, "3105": 245, "3203": 250,
                        "4000 Series (Aluminum-Silicon Alloys)": 255, "4032": 260, "4043": 265, "4145": 270, "4643": 275,
                        "5000 Series (Aluminum-Magnesium Alloys)": 280, "5005": 285, "5052": 290, "5083": 295, "5086": 300, "5182": 305, "5251": 310, "5454": 315, "5657": 320,
                        "6000 Series (Aluminum-Magnesium-Silicon Alloys)": 325, "6005": 330, "6061": 335, "6063": 340, "6082": 345,
                        "7000 Series (Aluminum-Zinc Alloys)": 350, "7005": 355, "7050": 360, "7075": 365, "7475": 370,
                        "8000 Series (Other Elements)": 375, "8006": 380, "8111": 385, "8500": 390, "8510": 395, "8520": 400
                    },
                    brass: {
                        "C21000 (Gilding Metal)": 140, "C22000 (Commercial Bronze)": 145, "C23000 (Red Brass)": 150, "C24000 (Low Brass)": 155, "C26000 (Cartridge Brass)": 160, "C28000 (Muntz Metal)": 165, "C35300 (Leaded Brass)": 170, "C36000 (Free-Cutting Brass)": 175
                    },
                    bronze: {
                        "C22000 (Commercial Bronze)": 90, "C22600 (Red Brass)": 95, "C51000 (Phosphor Bronze)": 100, "C52100 (Phosphor Bronze)": 105, "C54400 (Phosphor Bronze)": 110, "C90300 (Tin Bronze)": 115, "C90500 (Tin Bronze)": 120, "C90700 (Tin Bronze)": 125, "C93200 (Bearing Bronze)": 130, "C95400 (Aluminum Bronze)": 135, "C95900 (Aluminum Bronze)": 140, "C86300 (Manganese Bronze)": 145
                    },
                    copper: {
                        "Pure Copper (C11000)": 110, "Oxygen-Free Copper (C10100)": 115, "Deoxidized High-Phosphorus Copper (C12200)": 120, "Electrolytic Tough Pitch (ETP) Copper (C11000)": 125, "Chromium Copper (C18200)": 130, "Beryllium Copper (C17200)": 135, "Nickel Silver (C74500)": 140, "Brass (C26000)": 145, "Phosphor Bronze (C51000)": 150, "Silicon Bronze (C65500)": 155
                    },
                    nickel: {
                        "Nickel 200": 90, "Nickel 201": 95, "Nickel 205": 100, "Nickel 270": 105, "Nickel 400 (Monel 400)": 110, "Nickel 404": 115, "Nickel 600 (Inconel 600)": 120, "Nickel 625 (Inconel 625)": 125, "Nickel 718 (Inconel 718)": 130, "Nickel K500 (Monel K500)": 135, "Nickel 800 (Incoloy 800)": 140, "Nickel 825 (Incoloy 825)": 145
                    },
                    carbonSteel: {
                        "Low Carbon Steel": 100, "1008 Steel": 105, "1010 Steel": 110, "1018 Steel": 115, "1020 Steel": 120,
                        "Medium Carbon Steel": 125, "1040 Steel": 130, "1045 Steel": 135, "1050 Steel": 140, "1060 Steel": 145,
                        "High Carbon Steel": 150, "1070 Steel": 155, "1080 Steel": 160, "1090 Steel": 165, "1095 Steel": 170,
                        "Ultra-High Carbon Steel": 175, "1100 Steel": 180, "1150 Steel": 185, "1200 Steel": 190
                    },
                    alloySteel: {
                        "4140 Alloy Steel": 90, "4340 Alloy Steel": 95, "4130 Alloy Steel": 100, "8620 Alloy Steel": 105, "9310 Alloy Steel": 110,
                        "6150 Alloy Steel": 115, "4340V Alloy Steel": 120, "52100 Alloy Steel": 125, "300M Alloy Steel": 130, "Maraging Steel (18Ni-300)": 135, "Maraging Steel (18Ni-250)": 140, "AISI 4145 Alloy Steel": 145
                    },
                    stainlessSteel: {
                        "Austenitic Stainless Steel": 85, "Ferritic Stainless Steel": 90, "Martensitic Stainless Steel": 95, "Duplex Stainless Steel": 100, "Precipitation-Hardening Stainless Steel": 105
                    },
                    toolSteel: {
                        "A2 Steel": 75, "D2 Steel": 80, "O1 Steel": 85, "M2 Steel": 90, "S7 Steel": 95, "H13 Steel": 100, "W1 Steel": 105
                    },
                    inconel: {
                        "Inconel 600": 70, "Inconel 601": 75, "Inconel 617": 80, "Inconel 625": 85, "Inconel 686": 90,
                        "Inconel 690": 95, "Inconel 693": 100, "Inconel 718": 105, "Inconel 725": 110, "Inconel 750": 115, "Inconel 751": 120, "Inconel 792": 125, "Inconel X-750": 130, "Inconel HX": 135, "Inconel 939": 140
                    },
                    titanium: {
                        "Grade 1 (Pure Titanium)": 100, "Grade 2 (Commercially Pure Titanium)": 105, "Grade 3 (Commercially Pure Titanium)": 110, "Grade 4 (Commercially Pure Titanium)": 115, "Grade 5 (Ti-6Al-4V)": 120,
                        "Grade 6 (Al-4V-2Sn)": 125, "Grade 7 (Ti-0.2Pd)": 130, "Grade 9 (Ti-3Al-2.5V)": 135, "Grade 12 (Ti-0.3Mo-0.8Ni)": 140, "Grade 23 (Ti-6Al-4V ELI)": 145
                    },
                    magnesium: {
                        "AZ31B": 90, "AZ61A": 95, "AZ80A": 100, "ZK60A": 105, "WE43": 110, "Elektron 21": 115, "Magnesium ZM21": 120
                    },
                    zinc: {
                        "Zamak 2": 140, "Zamak 3": 145, "Zamak 5": 150, "Zamak 7": 155, "ZA-8": 160, "ZA-12": 165, "ZA-27": 170, "Zinc 1100": 175, "Zinc 1600": 180, "Zinc 3900": 185
                    },
                    tungsten: {
                        "Pure Tungsten": 60, "Tungsten Carbide": 65, "Heavy Metal Alloys (W-Ni-Fe)": 70, "Heavy Metal Alloys (W-Ni-Cu)": 75, "Tungsten-Copper Alloys": 80,
                        "Tungsten-Rhenium Alloys": 85, "Tungsten-Thorium Alloys": 90, "Tungsten-Molybdenum Alloys": 95
                    },
                    molybdenum: {
                        "Pure Molybdenum": 80, "Molybdenum-Tungsten Alloys": 85, "Molybdenum-Lanthanum Alloys": 90, "TZM (Titanium-Zirconium-Molybdenum) Alloy": 95, "Molybdenum-Rhenium Alloys": 100
                    },
                    cobalt: {
                        "Cobalt 6B": 90, "Cobalt 6K": 95, "Cobalt L-605": 100, "Cobalt R-41": 105, "Cobalt FSX-414": 110, "Cobalt HS-188": 115, "Cobalt MAR-M-509": 120, "Cobalt MAR-M-918": 125
                    },
                    gold: {
                        "24K Gold (99.9% Pure)": 50, "22K Gold": 52, "18K Gold": 54, "14K Gold": 56, "10K Gold": 58, "White Gold": 60, "Rose Gold": 62, "Green Gold": 64
                    },
                    silver: {
                        "Fine Silver (99.9% Pure)": 65, "Sterling Silver (92.5% Silver, 7.5% Copper)": 67, "Argentium Silver (93.5% or 96% Silver)": 69, "Coin Silver (90% Silver, 10% Copper)": 71, "Britannia Silver (95.8% Silver)": 73
                    },
                    platinum: {
                        "Pt 950 (95% Platinum, 5% Other Metals)": 60, "Pt 900 (90% Platinum, 10% Other Metals)": 62, "Pt 850 (85% Platinum, 15% Other Metals)": 64, "Iridium-Platinum Alloys": 66, "Ruthenium-Platinum Alloys": 68
                    },
                    palladium: {
                        "Pd 500 (50% Palladium, 50% Silver)": 65, "Pd 950 (95% Palladium, 5% Other Metals)": 67, "Pd 999 (99.9% Pure Palladium)": 69, "Palladium-Silver Alloys": 71, "Palladium-Copper Alloys": 73
                    },
                    lead: {
                        "Pure Lead": 45, "Lead-Antimony Alloys": 47, "Lead-Tin Alloys": 49, "Lead-Calcium Alloys": 51, "Lead-Silver Alloys": 53
                    },
                    tin: {
                        "Pure Tin": 40, "Tin-Lead Alloys (Solder)": 42, "Tin-Silver Alloys": 44, "Tin-Copper Alloys (Bronze)": 46, "Tin-Zinc Alloys": 48
                    },
                    zirconium: {
                        "Zirconium 702 (Pure Zirconium)": 70, "Zirconium 704 (Zr-2.5Nb)": 72, "Zirconium 705 (Zr-3Al-2.5Nb)": 74, "Zircaloy-2 (Zr-Sn-Fe-Cr-Ni)": 76, "Zircaloy-4 (Zr-Sn-Fe-Cr)": 78
                    },
                    plastics: {
                        "Polyethylene (PE)": 500, "High-Density Polyethylene (HDPE)": 505, "Low-Density Polyethylene (LDPE)": 510, "Linear Low-Density Polyethylene (LLDPE)": 515,
                        "Polypropylene (PP)": 520, "Polyvinyl Chloride (PVC)": 525, "Polystyrene (PS)": 530, "High Impact Polystyrene (HIPS)": 535, "Expanded Polystyrene (EPS)": 540,
                        "Polyethylene Terephthalate (PET)": 545, "Polycarbonate (PC)": 550, "Acrylonitrile Butadiene Styrene (ABS)": 555, "Nylon (Polyamide, PA)": 560,
                        "Polytetrafluoroethylene (PTFE, Teflon)": 565, "Polyoxymethylene (POM, Acetal)": 570, "Polyethylene Chlorinated (CPE)": 575, "Polyurethane (PU)": 580,
                        "Polylactic Acid (PLA)": 585, "Polyethylene Naphthalate (PEN)": 590, "Polybutylene Terephthalate (PBT)": 595, "Polyetheretherketone (PEEK)": 600,
                        "Polyphenylene Oxide (PPO)": 605, "Polysulfone (PSU)": 610
                    },
                    glass: {
                        "Soda-Lime Glass": 180, "Borosilicate Glass": 185, "Lead Glass (Crystal)": 190, "Aluminosilicate Glass": 195, "Fused Silica Glass": 200,
                        "Chemically Strengthened Glass": 205, "Laminated Glass": 210, "Tempered Glass": 215, "Glass Ceramic": 220, "Optical Glass": 225
                    },
                    wood: {
                        "Hardwood": 200, "Oak": 205, "Maple": 210, "Cherry": 215, "Walnut": 220, "Mahogany": 225, "Teak": 230, "Birch": 235, "Ash": 240, "Beech": 245,
                        "Softwood": 250, "Pine": 255, "Cedar": 260, "Fir": 265, "Spruce": 270, "Redwood": 275, "Hemlock": 280,
                        "Engineered Wood": 285, "Plywood": 290, "Medium Density Fiberboard (MDF)": 295, "Particle Board": 300, "Oriented Strand Board (OSB)": 305, "Laminated Veneer Lumber (LVL)": 310, "Cross-Laminated Timber (CLT)": 315, "Glulam (Glued Laminated Timber)": 320
                    }
                }
            };
    
            if (baseSpeeds[tool] && baseSpeeds[tool][material] && baseSpeeds[tool][material][alloy]) {
                return `${(baseSpeeds[tool][material][alloy] / diameter * 1).toFixed(2)} RPM`;
            }
            
    
            return 'N/A'; // Return 'N/A' if no matching speed is found
        }
    
        updateAlloyDropdown();