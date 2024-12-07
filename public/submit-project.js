document.getElementById('submitWorkForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    // Get the form data (including files and message)
    const formData = new FormData();
    const message = document.getElementById('message').value;
    const files = document.getElementById('files').files;

    // Check if a message is entered
    if (!message || files.length === 0) {
        const statusMessageDiv = document.getElementById('statusMessage');
        statusMessageDiv.classList.remove('hidden');
        statusMessageDiv.innerHTML = `
            <div class="bg-red-100 text-red-800 border border-red-300 rounded-md p-4">
                <p><strong>Error:</strong> Please provide a message and select at least one file.</p>
            </div>
        `;
        return;
    }

    formData.append('message', message);

    // Add files to FormData object
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }

    // Get the gig ID dynamically (Example: extracting it from URL)
    const gigId = '67534bf557c99cdfb4d065c2' // Assuming gigId is the last part of the URL

    try {
        const response = await fetch(`/api/v1/gigs/${gigId}/files`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        const statusMessageDiv = document.getElementById('statusMessage');
        statusMessageDiv.classList.remove('hidden');

        if (response.ok) {
            statusMessageDiv.innerHTML = `
                <div class="bg-green-100 text-green-800 border border-green-300 rounded-md p-4">
                    <p><strong>${data.msg}</strong></p>
                    <p><strong>Files Submitted:</strong></p>
                    <ul>
                        ${data.submission.files.map(file => `<li><a href="${file}" target="_blank">${file}</a></li>`).join('')}
                    </ul>
                    <p><strong>Message:</strong> ${data.submission.message}</p>
                    <p><strong>Submitted At:</strong> ${new Date(data.submission.submittedAt).toLocaleString()}</p>
                </div>
            `;
            // Optionally clear the form
            document.getElementById('message').value = '';
            document.getElementById('files').value = '';
        } else {
            statusMessageDiv.innerHTML = `
                <div class="bg-red-100 text-red-800 border border-red-300 rounded-md p-4">
                    <p><strong>${data.msg}</strong></p>
                    <p><strong>Error:</strong> ${data.error}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error submitting work:", error);
        const statusMessageDiv = document.getElementById('statusMessage');
        statusMessageDiv.classList.remove('hidden');
        statusMessageDiv.innerHTML = `
            <div class="bg-red-100 text-red-800 border border-red-300 rounded-md p-4">
                <p><strong>File submission failed:</strong> ${error.message}</p>
            </div>
        `;
    }
});
