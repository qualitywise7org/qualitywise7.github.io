document.addEventListener("DOMContentLoaded", async function () {
  const jobListings = document.getElementById("jobListings");
  const company=document.getElementById("searchCompany");
  const search=document.getElementById("search");
  

  let querySnapshot;
  querySnapshot = await getDocs(collection(db, "hiring"));

  // Create function to render table 
  async function renderJobListing(querySnapshot) {
    jobListings.innerHTML = ''; // Clear existing table rows

    try {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const row = document.createElement("tr");
        row.innerHTML = `
          <td >${data?.title || "NOT DISCLOSED"}</td>
          <td >${data?.stipend || "NOT DISCLOSED"}</td>
          <td class="custom-width">${data?.role || "NOT DISCLOSED"}</td>
          <td >${data?.location || "NOT DISCLOSED"}</td>
          <td >${data?.company_name || "NOT DISCLOSED"}</td>
          <td ><a href="${data?.job_description_doc || "#"}">Click Here</a></td>
          <td><button class="applyButton" data-jobid="${doc.id}">Apply</button></td>
        `;
        jobListings.appendChild(row);
      });
    } catch (error) {
      console.error("Error retrieving job listings:", error);
    } 
  }

  //call renderJobListing function when page loads
  await renderJobListing(querySnapshot);

  // Add event listener to search job
  search.addEventListener('input',async () =>{
    const search=document.getElementById("search").value.toLowerCase();
    try {
    const queryParams= new URLSearchParams(window.location.search);
    
    queryParams.set('search', search);
    const newUrl=`${window.location.pathname}?${queryParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
    
    if(search==""){
      querySnapshot = await getDocs(
        (collection(db, "hiring"))
      );
      await renderJobListing(querySnapshot);
    } else {
      let param1=queryParams.get('search').toLowerCase();
          const promises=[
            getDocs(query(collection(db,'hiring'),where('company_name','>=', param1),where('company_name','<=', param1+ "\uf8ff"))),
            getDocs(query(collection(db,'hiring'),where('role','>=', param1),where('role','<=', param1+ "\uf8ff"))),
            getDocs(query(collection(db,'hiring'),where('location','>=', param1),where('location','<=', param1+ "\uf8ff"))),
            getDocs(query(collection(db,'hiring'),where('id','>=', param1),where('id','<=', param1+ "\uf8ff"))),
            getDocs(query(collection(db,'hiring'),where('stipend','>=', param1),where('stipend','<=', param1+ "\uf8ff"))),
            getDocs(query(collection(db,'hiring'),where('title','>=', param1),where('title','<=', param1+ "\uf8ff"))),
          ];
          return Promise.all(promises)
          .then(results => {
          let combinedResults = [];
          results.forEach(querySnapshot => {
          querySnapshot.forEach(doc => {
          combinedResults.push(doc);
      });
    });
    return combinedResults; // Return the combined results
  })
  .then(combinedResults => {
    renderJobListing(combinedResults);
  })
  .catch(error => console.error("Error retrieving job listings:", error));
    }

    } catch (error) {
      console.log("search",error);
    }
  });

    // Add event listener to search company name
    company.addEventListener('input',async () =>{
      const company=document.getElementById("searchCompany").value;
      try {
      const queryParams= new URLSearchParams(window.location.search);
      queryParams.set('company_name',  company);
      const newUrl=`${window.location.pathname}?${queryParams.toString()}`;
      window.history.replaceState({}, '', newUrl);

      if(company==""){
        querySnapshot = await getDocs(
          (collection(db, "hiring"))
        );
        await renderJobListing(querySnapshot);
      } else {
        let param1=queryParams.get('company_name').toLowerCase();
        querySnapshot = await getDocs(
            query(collection(db, "hiring"), where('company_name','>=', param1),where('company_name','<=', param1+ "\uf8ff"))
          );
          querySnapshot.forEach((doc)=>{
            console.log(doc.data(), "===========")
          })
          await renderJobListing(querySnapshot);
      }
      

      } catch (error) {

        console.log("search",error)
        
      }

    });


  if (email) {
    try {
      const appliedJobsRef = doc(db, "jobsapplied", email);
      const docSnap = await getDoc(appliedJobsRef);
      if (docSnap.exists()) {
        const appliedJobs = docSnap.data();

        for (const jobId in appliedJobs) {
          const button = document.querySelector(
            `.applyButton[data-jobid="${jobId}"]`
          );
          if (button) {
            button.textContent = "Applied";
            button.style.backgroundColor = "#45a049";
            button.disabled = true;
          }
        }
      }
    } catch {
      console.log("error");
    }
  }

  // Add event listener for Apply buttons
  const applyButtons = document.querySelectorAll(".applyButton");
  applyButtons.forEach((button) => {
    button.addEventListener("click", applyForJob);
  });

  async function applyForJob(event) {
    const button = event.target;
    const jobId = button.dataset.jobid;

    if (email) {
      try {
        const docRef = doc(db, "jobsapplied", email);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          updateDoc(docRef, { [jobId]: true });
          console.log("Job application updated");
        } else {
          await setDoc(docRef, { [jobId]: true });
          console.log("Job application added");
        }

        // Update button properties
        button.textContent = "Applied";
        button.style.backgroundColor = "#45a049";
        button.disabled = true;
      } catch (error) {
        console.error("Error applying for job:", error);
      }

      try {
        const docRef = doc(db, "hiring", jobId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const jobData = docSnap.data();
          const appliedCandidates = jobData.appliedCandidates || [];

          if (!appliedCandidates.includes(email)) {
            appliedCandidates.push(email);
            await updateDoc(docRef, { appliedCandidates });
            console.log("Candidate added to the list of applied candidates");
          } else {
            console.log("Candidate already applied for this job");
          }
        } else {
          console.log("Job document does not exist");
        }
      } catch (error) {
        console.error("Error updating applied candidates list:", error);
      }
    } else {
      alert("You are not logged In. Please login");
    }
  }
});
