document.addEventListener("DOMContentLoaded", () => {
function formatDate(isoString) {
  if (!isoString) return "No date recorded";

  const date = new Date(isoString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  let suffix = "th";
  if (day % 10 === 1 && day !== 11) suffix = "st";
  else if (day % 10 === 2 && day !== 12) suffix = "nd";
  else if (day % 10 === 3 && day !== 13) suffix = "rd";

  const time = date.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' });

  return day + suffix + " " + month + " " + year + ", " + time;
}

  const dataList = document.getElementById("note-list");
  const dataForm = document.getElementById("note-form");
  const titleInput = document.getElementById("title-input"); 
  const bodyInput = document.getElementById("body-input"); 

  // Function to fetch data from the backend

 const fetchData = async () => {
  try {
    const response = await fetch("/api/data");
    const data = await response.json();
    dataList.innerHTML = "";

    data.forEach((item) => {
      const li = document.createElement("li");
      li.className = "note-item";

      const titleEl = document.createElement("h3");
      titleEl.className = "note-title";     
      titleEl.textContent = item.title;  

      const bodyEl = document.createElement("p");
      bodyEl.className = "note-body";      
      bodyEl.textContent = item.body;   

      const dateEl = document.createElement("small");
      dateEl.className = "note-date";
      dateEl.textContent = formatDate(item.createdAt);

      li.appendChild(titleEl);
      li.appendChild(bodyEl);
      li.appendChild(dateEl);

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.className = "btn-edit";

      editBtn.addEventListener("click", () => {
        const titleEditInput = document.createElement("input");
        titleEditInput.type = "text";
        titleEditInput.value = item.title;
        titleEditInput.className = "edit-input";

        const bodyEditInput = document.createElement("textarea");
        bodyEditInput.value = item.body;
        bodyEditInput.className = "edit-input";

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        saveBtn.className = "btn-save";
        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Cancel";
        cancelBtn.className = "btn-cancel";

        li.innerHTML = "";
        li.appendChild(titleEditInput);
        li.appendChild(bodyEditInput);
        li.appendChild(saveBtn);
        li.appendChild(cancelBtn);

        saveBtn.addEventListener("click", async () => {
          try {
            const response = await fetch("/api/data/" + item.id, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: titleEditInput.value, body: bodyEditInput.value, updatedAt: new Date().toISOString() }),
            });
            if (response.ok) {
              fetchData();
            }
          } catch (error) {
            console.error("Error updating data:", error);
          }
        });

        cancelBtn.addEventListener("click", () => {
          fetchData();
        });
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "btn-delete"; 

      // click listener
      deleteBtn.addEventListener("click", async () => {
        try {
          const response = await fetch("/api/data/" + item.id, {
            method: "DELETE"
          });
          if (response.ok) {
            fetchData();
          }
        } catch (error) {
          console.error("Error deleting data:", error);
        }
      });

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "note-actions";
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

li.appendChild(actionsDiv);
      dataList.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

// OCR functionality 

const photoInput = document.getElementById('photo-input');
const ocrStatus = document.getElementById('ocr-status');
const bodyInput = document.getElementById('body-input');

photoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  ocrStatus.textContent = 'Reading photo...';

  Tesseract.recognize(file, 'eng')
    .then(result => {
      bodyInput.value += result.data.text;
      ocrStatus.textContent = 'Done!';
    })
    .catch(err => {
      console.error('OCR error:', err);
      ocrStatus.textContent = 'Failed to read photo.';
    });
});

  // Handle form submission to add new data
  dataForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const newData = { title: titleInput.value, body: bodyInput.value };

  try {
    const response = await fetch("/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newData),
    });

    if (response.ok) {
      titleInput.value = ""; // clear title input
      bodyInput.value = ""; // clear body input
      fetchData();
    }
  } catch (error) {
    console.error("Error adding data:", error);
  }
});

  // Fetch data on page load
  fetchData();
});
