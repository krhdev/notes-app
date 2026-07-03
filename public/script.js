document.addEventListener("DOMContentLoaded", () => {
  const dataList = document.getElementById("data-list");
  const dataForm = document.getElementById("data-form");
  const dataInput = document.getElementById("data-input");

  // Function to fetch data from the backend

 const fetchData = async () => {
  try {
    const response = await fetch("/api/data");
    const data = await response.json();
    dataList.innerHTML = "";

    data.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item.id + ": " + item.text;

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";

      editBtn.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = item.text;

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Cancel";

        li.innerHTML = "";
        li.appendChild(input);
        li.appendChild(saveBtn);
        li.appendChild(cancelBtn);

        saveBtn.addEventListener("click", async () => {
          try {
            const response = await fetch("/api/data/" + item.id, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: input.value }),
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

      // 👇 click listener lives HERE, still inside forEach
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

      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
      dataList.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

  // Handle form submission to add new data
  dataForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const newData = { text: dataInput.value };

    try {
      const response = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });

      if (response.ok) {
        dataInput.value = ""; // Clear input field
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error("Error adding data:", error);
    }
  });

  // Fetch data on page load
  fetchData();
});
