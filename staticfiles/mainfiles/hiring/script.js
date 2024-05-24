

document.addEventListener("DOMContentLoaded", async function () {
  const jobListings = document.getElementById("jobListings");
  const company=document.getElementById("searchItem");
  const job=document.getElementById("searchJob");
  const searchCode=document.getElementById("searchCode");

  let querySnapshot;
  querySnapshot = await getDocs(collection(db, "hiring"));

  // Create function to render table 
  async function renderJobListing() {
    jobListings.innerHTML = ''; // Clear existing table rows

    try {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="text-center">${data?.title || "NOT DISCLOSED"}</td>
          <td class="text-center">${"₹" + data?.stipend || "NOT DISCLOSED"}</td>
          <td class="text-center">${data?.role || "NOT DISCLOSED"}</td>
          <td class="text-center">${data?.location || "NOT DISCLOSED"}</td>
          <td class="text-center">${data?.company_name || "NOT DISCLOSED"}</td>
          <td class="text-center"><a href="${data?.job_description_doc || "#"}">Click Here</a></td>
          <td><button class="applyButton" data-jobid="${doc.id}">Apply</button></td>
        `;
        jobListings.appendChild(row);
      });
    } catch (error) {
      console.error("Error retrieving job listings:", error);
    } 
  }

  //call renderJobListing function when page loads
  await renderJobListing();

  // Add event listener to search job

  job.addEventListener('input',async () =>{
    const role=document.getElementById("searchJob").value.toLowerCase();
    try {
    const queryParams= new URLSearchParams(window.location.search);
    
    queryParams.set('role', role);
    const newUrl=`${window.location.pathname}?${queryParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
    
    let param1=queryParams.get('role').toLowerCase();
      console.log( param1,"role")
      querySnapshot = await getDocs(
          query(collection(db, "hiring"), where("role", "==", param1.toLowerCase()))
        );
        console.log(querySnapshot,"querysnapshot");
        querySnapshot.forEach((doc)=>{
          console.log(doc.data(), "job")
        })

        await renderJobListing();

    } catch (error) {

      console.log("search",error)
      
    }

  });

  // Add event listener to search company code

  searchCode.addEventListener('input',async () =>{
    const code=document.getElementById("searchCode").value;
    
    console.log("click")
    try {
    const queryParams= new URLSearchParams(window.location.search);
    
    queryParams.set('company_code', code);
    const newUrl=`${window.location.pathname}?${queryParams.toString()}`;
    window.history.replaceState({}, '', newUrl);
    
    let param1=parseInt(queryParams.get('company_code'));
      console.log(typeof param1,"code")
      querySnapshot = await getDocs(
          query(collection(db, "hiring"), where("company_code", "==", param1))
        );
        console.log(querySnapshot,"querysnapshot");
        querySnapshot.forEach((doc)=>{
          console.log(doc.data(), "joio44")
        })

        await renderJobListing();

    } catch (error) {

      console.log("search",error)
      
    }

  });

    // Add event listener to search company name
    
    company.addEventListener('input',async () =>{
      const company=document.getElementById("searchItem").value;
      // const code=document.getElementById("searchCode").value;
      console.log("click")
      try {
      const queryParams= new URLSearchParams(window.location.search);
      queryParams.set('company_name',  company);
      // queryParams.set('company_code', code);
      const newUrl=`${window.location.pathname}?${queryParams.toString()}`;
      window.history.replaceState({}, '', newUrl);
      let param1=queryParams.get('company_name').toLowerCase();
      // let param2=queryParams.get('company_code');
        console.log( param1,"company");
        querySnapshot = await getDocs(
            query(collection(db, "hiring"), where("company_name", "==", param1))
          );
          console.log(querySnapshot,"querysnapshot");
          querySnapshot.forEach((doc)=>{
            console.log(doc.data(), "joio44")
          })

          await renderJobListing();

      } catch (error) {

        console.log("search",error)
        
      }

    });

    
  
  // try{
  //   let querySnapshot;
  //   // if(param1.length>1){
  //   //   await getDocs(
  //   //     query(collection(db, "hiring"), where("company_name", "==", param1))
  //   //   );
  //   // }else{
  //      querySnapshot= await getDocs(collection(db, "hiring"));
    

  //   querySnapshot.forEach((doc)=>{
  //   let   data=doc.data();
  //     const row = document.createElement("tr");
     
  //       row.innerHTML = `
  //       <td class="text-center">${data?.title || "NOT DISCLOSED"}</td>
  //       <td class="text-center">${"₹" + data?.stipend || "NOT DISCLOSED"}</td>
  //       <td class="text-center">${data?.role || "NOT DISCLOSED"}</td>
  //       <td class="text-center">${data?.location || "NOT DISCLOSED"}</td>
  //       <td class="text-center">${data?.company_name || "NOT DISCLOSED"}</td>
  //       <td class="text-center"><a href="${
  //         data?.job_description_doc || "#"
  //       }">Click Here</a></td>
  //       <td><button class="applyButton" data-jobid="${
  //         doc.id
  //       }">Apply</button></td>
  //     `;
  //     jobListings.appendChild(row);
  //     console.log(data)
      
  //   })
  // } catch (error) {
  //   console.error("Error retrieving job listings:", error);
  // }
  //   // });

  

  

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
