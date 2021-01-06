window.onload = function() {
    let popup = document.getElementById('popup');
    let form = popup.querySelector('form');

    /**
     * Event listener to open/close download modal.
     */
    document.getElementById('download').addEventListener('click', function() {
        form.reset();
        toggleDisplay(popup);
    });

    /**
     * Event listener to close download modal on close button click.
     */
    document.getElementById('close-btn').addEventListener('click', function() {
        toggleDisplay(popup);
    });

    /**
     * Event listener to close download modal on submit.
     */
    form.onsubmit = function() {
        toggleDisplay(popup);
    };

    /**
     * Event listener to expand date selector input fields.
     */
    document.getElementById('date-selector').addEventListener('click', function() {
        toggleDisplay(document.getElementById('date-container'), 'flex');
    });

    /**
     * Event listener for clear start date button.
     */
    document.querySelector('#startDate-wrapper label.small').addEventListener('click', function() {
        document.getElementById('startDate').value = '';
    });

    /**
     * Event listener for clear start date button.
     */
    document.querySelector('#endDate-wrapper label.small').addEventListener('click', function() {
        document.getElementById('endDate').value = '';
    });
}

/**
 * Helper function to toggle the display of a DOM element.
 * @param {DOMElement} element DOM element whose display we want to toggle
 * @param {string} display value for display property when visible, defaults to 'block'
 */
function toggleDisplay(element, display = 'block') {
    element.style.display = element.style.display !== display ? display : 'none';
}