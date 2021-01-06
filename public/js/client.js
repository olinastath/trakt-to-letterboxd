window.onload = function() {
    let popup = document.getElementById('popup');
    let form = popup.querySelector('form');

    document.getElementById('download').addEventListener('click', function() {
        form.reset();
        toggleDisplay(popup);
    });

    document.getElementById('close-btn').addEventListener('click', function() {
        toggleDisplay(popup);
    });

    document.getElementById('download-btn').addEventListener('click', function() {
        toggleDisplay(popup);
    });

    document.getElementById('date-selector').addEventListener('click', function() {
        toggleDisplay(document.getElementById('date-container'), 'flex');
    });
}

function toggleDisplay(element, display = 'block') {
    element.style.display = element.style.display !== display ? display : 'none';
}