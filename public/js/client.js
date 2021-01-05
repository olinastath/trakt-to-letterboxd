let popup = document.getElementById('popup');

document.getElementById('download').addEventListener('click', function() {
    toggleDisplay(popup);
});

document.getElementById('close-btn').addEventListener('click', function() {
    toggleDisplay(popup);
});

let toggleDisplay = function(element) {
    element.style.display = element.style.display !== 'block' ? 'block' : 'none';
}