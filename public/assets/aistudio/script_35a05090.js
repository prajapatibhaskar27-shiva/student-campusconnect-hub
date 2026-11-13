/* CampusConnect — interactive demo powered by vanilla JavaScript + LocalStorage */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const STORAGE = { tasks: "cc_tasks_v1", posts: "cc_posts_v1", profile: "cc_profile_v1", rsvps: "cc_rsvps_v1", likes: "cc_likes_v1" };

const seedEvents = [
  {id:1,title:"Buildathon 2026",category:"Hackathon",date:"2026-11-21",time:"10:00 AM",place:"Innovation Lab",desc:"A 24-hour team challenge to turn bold ideas into working prototypes.",icon:"⌘",spots:"Limited seats"},
  {id:2,title:"AI & Beyond Workshop",category:"Workshop",date:"2026-11-25",time:"02:00 PM",place:"Seminar Hall 2",desc:"Explore practical machine learning workflows and responsible AI.",icon:"✧",spots:"Open registration"},
  {id:3,title:"Designing Your Tech Career",category:"Talk",date:"2026-11-28",time:"11:30 AM",place:"Main Auditorium",desc:"A candid session on portfolios, internships and finding your direction.",icon:"↗",spots:"Open registration"},
  {id:4,title:"Community Code Night",category:"Community",date:"2026-12-02",time:"05:00 PM",place:"Computer Lab",desc:"Bring your laptop, share a project and learn alongside other builders.",icon:"⌘",spots:"Bring your laptop"},
  {id:5,title:"Frontend Sprint",category:"Workshop",date:"2026-12-06",time:"12:00 PM",place:"Design Studio",desc:"Create a polished responsive interface in a guided mini sprint.",icon:"▣",spots:"Open registration"},
  {id:6,title:"Campus Innovation Fest",category:"Hackathon",date:"2026-12-12",time:"09:00 AM",place:"Central Ground",desc:"Showcase student-led solutions for real campus and community needs.",icon:"✦",spots:"Team entries"}
];
const resources = [
  {title:"MDN Web Docs",topic:"Development",desc:"A trusted reference for HTML, CSS, JavaScript and modern web APIs.",icon:"⌘",url:"https://developer.mozilla.org/"},
  {title:"JavaScript.info",topic:"Development",desc:"A detailed, practical guide to the JavaScript language and browser concepts.",icon:"JS",url:"https://javascript.info/"},
  {title:"freeCodeCamp",topic:"Development",desc:"Hands-on coding lessons and projects to build practical development skills.",icon:"⌁",url:"https://www.freecodecamp.org/"},
  {title:"Google AI Education",topic:"AI & Data",desc:"Explore machine learning concepts, tools and learning pathways.",icon:"✧",url:"https://ai.google/education/"},
  {title:"Kaggle Learn",topic:"AI & Data",desc:"Short, interactive courses in Python, data visualization and machine learning.",icon:"◈",url:"https://www.kaggle.com/learn"},
  {title:"Figma Learn",topic:"Design",desc:"Learn interface design, prototyping and collaborative design workflows.",icon:"◩",url:"https://help.figma.com/hc/en-us/categories/360002051613-Learn-design"},
  {title:"GitHub Skills",topic:"Career",desc:"Build confidence with GitHub through interactive, hands-on courses.",icon:"⌥",url:"https://skills.github.com/"},
  {title:"Google Career Certificates",topic:"Career",desc:"Explore career-focused learning paths and professional skills.",icon:"↗",url:"https://grow.google/certificates/"}
];
const starterTasks = [
  {id:101,text:"Explore upcoming campus events",priority:"Low",due:"",done:false},
  {id:102,text:"Update my project portfolio",priority:"High",due:"",done:false},
  {id:103,text:"Spend 20 minutes learning JavaScript",priority:"Medium",due:"",done:true}
];
const starterPosts = [
  {id:1,name:"Aarav",text:"Looking for two teammates interested in building an accessibility-focused campus app. Let’s brainstorm this week! 🚀",time:"2 hours ago",likes:4},
  {id:2,name:"Meera",text:"Small win: finally shipped my first responsive portfolio. Sharing it soon — keep building, everyone. ✨",time:"Yesterday",likes:8},
  {id:3,name:"Dev",text:"Any recommendations for beginner-friendly machine learning project ideas? Would love to collaborate.",time:"Yesterday",likes:3}
];

function read(key, fallback){try{const value=localStorage.getItem(key);return value?JSON.parse(value):fallback}catch{return fallback}}
function write(key,value){localStorage.setItem(key,JSON.stringify(value))}
let tasks=read(STORAGE.tasks,starterTasks);
let posts=read(STORAGE.posts,starterPosts);
let profile=read(STORAGE.profile,{name:"Student",course:""});
let rsvps=read(STORAGE.rsvps,[]);
let likes=read(STORAGE.likes,[]);
let toastTimer;

function toast(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2500)}
function initials(name){return (name||"S").trim().charAt(0).toUpperCase()}
function formatDate(date){if(!date)return "Date to be announced";return new Date(date+"T12:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

function renderProfile(){
  $("#sidebarName").textContent=profile.name||"Student";
  $(".avatar").textContent=initials(profile.name);$("#topProfileBtn").textContent=initials(profile.name);
  $("#nameInput").value=profile.name||"";$("#courseInput").value=profile.course||"";
}
function renderEvents(){
  const query=($("#eventSearch")?.value||"").toLowerCase();
  const filter=$("#eventFilter")?.value||"all";
  const filtered=seedEvents.filter(e=>(filter==="all"||e.category===filter)&&`${e.title} ${e.category} ${e.desc}`.toLowerCase().includes(query));
  $("#eventsGrid").innerHTML=filtered.length?filtered.map(e=>`<article class="event-card"><div class="event-card-top"><span class="event-art">${e.icon}</span><span class="tag">${e.category}</span></div><h3>${e.title}</h3><p>${e.desc}</p><div class="event-meta"><span>◷ ${formatDate(e.date)} · ${e.time}</span><span>⌖ ${e.place}</span></div><div class="event-card-footer"><small>${e.spots}</small><button class="btn ${rsvps.includes(e.id)?"joined":"btn-primary"} ${rsvps.includes(e.id)?"joined":""}" data-rsvp="${e.id}">${rsvps.includes(e.id)?"✓ Registered":"Register ↗"}</button></div></article>`).join(""):`<div class="empty-state">No events match that search. Try another keyword or category.</div>`;
  $("#featuredEvents").innerHTML=seedEvents.slice(0,3).map(e=>`<div class="event-row"><div class="event-date"><strong>${new Date(e.date+"T12:00:00").getDate()}</strong><small>${new Date(e.date+"T12:00:00").toLocaleDateString("en-IN",{month:"short"}).toUpperCase()}</small></div><div class="event-info"><strong>${e.title}</strong><small>${e.category} · ${e.place}</small></div><span class="tag">${e.category}</span></div>`).join("");
  $("#eventStat").textContent=String(seedEvents.length).padStart(2,"0");
}
function renderTasks(){
  const filter=$("#taskFilter")?.value||"all";
  const shown=tasks.filter(t=>filter==="all"||(filter==="active"&&!t.done)||(filter==="done"&&t.done));
  $("#taskCount").textContent=tasks.length;
  $("#taskList").innerHTML=shown.length?shown.map(t=>`<div class="task-item ${t.done?"is-done":""}"><input class="task-check" type="checkbox" data-task-check="${t.id}" ${t.done?"checked":""} aria-label="Mark ${escapeHTML(t.text)} complete"><div class="task-item-main"><strong>${escapeHTML(t.text)}</strong><small>${t.due?`Due ${formatDate(t.due)}`:"No due date"}</small></div><span class="priority ${t.priority}">${t.priority}</span><button class="delete-task" data-task-delete="${t.id}" aria-label="Delete task">×</button></div>`).join(""):`<div class="empty-state">${filter==="done"?"No completed tasks yet.":"Nothing here yet. Add your first task!"}</div>`;
  const completed=tasks.filter(t=>t.done).length;
  const percent=tasks.length?Math.round(completed/tasks.length*100):0;
  $("#taskStat").textContent=String(completed).padStart(2,"0");
  $("#focusPercent").textContent=percent+"%";$("#focusBar").style.width=percent+"%";
  const focus=tasks.filter(t=>!t.done).slice(0,3);
  $("#focusTasks").innerHTML=focus.length?focus.map(t=>`<label class="focus-task"><input type="checkbox" data-task-check="${t.id}"><span>${escapeHTML(t.text)}</span></label>`).join(""):`<div class="empty-state">All caught up. Nice work! ✦</div>`;
}
function renderResources(){
  const query=($("#resourceSearch")?.value||"").toLowerCase(),filter=$("#resourceFilter")?.value||"all";
  const filtered=resources.filter(r=>(filter==="all"||r.topic===filter)&&`${r.title} ${r.topic} ${r.desc}`.toLowerCase().includes(query));
  $("#resourcesGrid").innerHTML=filtered.length?filtered.map(r=>`<article class="resource-card"><div class="resource-icon">${r.icon}</div><span class="tag">${r.topic}</span><h3>${r.title}</h3><p>${r.desc}</p><a href="${r.url}" target="_blank" rel="noopener noreferrer">Open resource ↗</a></article>`).join(""):`<div class="empty-state">No resources found. Try a different search.</div>`;
  $("#resourceStat").textContent=String(resources.length).padStart(2,"0");
}
function renderPosts(){
  $("#postStat").textContent=String(posts.length).padStart(2,"0");
  $("#communityFeed").innerHTML=posts.length?posts.map(p=>`<article class="post-card"><div class="post-head"><div class="post-avatar">${initials(p.name)}</div><div><strong>${escapeHTML(p.name)}</strong><small>${escapeHTML(p.time)}</small></div></div><p>${escapeHTML(p.text)}</p><div class="post-actions"><button class="${likes.includes(p.id)?"liked":""}" data-like="${p.id}">${likes.includes(p.id)?"♥":"♡"} ${p.likes+(likes.includes(p.id)?1:0)} likes</button><button data-copy="${p.id}">↗ Share thought</button></div></article>`).join(""):`<div class="empty-state">No posts yet. Start the conversation!</div>`;
}
function renderAll(){renderProfile();renderEvents();renderTasks();renderResources();renderPosts()}
function showSection(id){
  const target=document.getElementById(id)||$("#home");
  $$(".page-section").forEach(s=>s.classList.toggle("active-section",s===target));
  $$(".nav-link").forEach(a=>a.classList.toggle("active",a.dataset.section===target.id));
  $("#pageName").textContent=target.id==="home"?"Overview":target.id.charAt(0).toUpperCase()+target.id.slice(1);
  $("#sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}
function navigateFromHash(){showSection(location.hash.replace("#","")||"home")}
$$(".nav-link").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();history.pushState(null,"",a.getAttribute("href"));showSection(a.dataset.section)}));
$$('a[href^="#"]').filter(a=>!a.classList.contains("nav-link")).forEach(a=>a.addEventListener("click",e=>{const id=a.getAttribute("href").slice(1);if(document.getElementById(id)){e.preventDefault();history.pushState(null,"","#"+id);showSection(id)}}));
window.addEventListener("popstate",navigateFromHash);
$("#menuBtn").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
document.addEventListener("click",e=>{if(window.innerWidth<=760&&!$("#sidebar").contains(e.target)&&!$("#menuBtn").contains(e.target))$("#sidebar").classList.remove("open")});

$("#eventSearch").addEventListener("input",renderEvents);$("#eventFilter").addEventListener("change",renderEvents);
$("#eventsGrid").addEventListener("click",e=>{const btn=e.target.closest("[data-rsvp]");if(!btn)return;const id=Number(btn.dataset.rsvp);rsvps=rsvps.includes(id)?rsvps.filter(x=>x!==id):[...rsvps,id];write(STORAGE.rsvps,rsvps);renderEvents();toast(rsvps.includes(id)?"You’re registered for this event!":"Registration removed.")});
$("#taskForm").addEventListener("submit",e=>{e.preventDefault();const text=$("#taskInput").value.trim();if(!text)return;tasks.unshift({id:Date.now(),text,priority:$("#taskPriority").value,due:$("#taskDue").value,done:false});write(STORAGE.tasks,tasks);e.target.reset();renderTasks();toast("Task added to your list.")});
$("#taskFilter").addEventListener("change",renderTasks);
$("#taskList").addEventListener("change",e=>{const id=Number(e.target.dataset.taskCheck);if(!id)return;tasks=tasks.map(t=>t.id===id?{...t,done:e.target.checked}:t);write(STORAGE.tasks,tasks);renderTasks()});
$("#focusTasks").addEventListener("change",e=>{const id=Number(e.target.dataset.taskCheck);if(!id)return;tasks=tasks.map(t=>t.id===id?{...t,done:e.target.checked}:t);write(STORAGE.tasks,tasks);renderTasks()});
$("#taskList").addEventListener("click",e=>{const btn=e.target.closest("[data-task-delete]");if(!btn)return;tasks=tasks.filter(t=>t.id!==Number(btn.dataset.taskDelete));write(STORAGE.tasks,tasks);renderTasks();toast("Task deleted.")});
$("#resourceSearch").addEventListener("input",renderResources);$("#resourceFilter").addEventListener("change",renderResources);
$("#postInput").addEventListener("input",()=>$("#charCount").textContent=$("#postInput").value.length);
$("#postForm").addEventListener("submit",e=>{e.preventDefault();const text=$("#postInput").value.trim();if(!text)return;posts.unshift({id:Date.now(),name:profile.name||"Student",text,time:"Just now",likes:0});write(STORAGE.posts,posts);$("#postInput").value="";$("#charCount").textContent="0";renderPosts();toast("Your update is live on the community board.")});
$("#communityFeed").addEventListener("click",e=>{const like=e.target.closest("[data-like]");if(like){const id=Number(like.dataset.like);likes=likes.includes(id)?likes.filter(x=>x!==id):[...likes,id];write(STORAGE.likes,likes);renderPosts();return}const share=e.target.closest("[data-copy]");if(share){const post=posts.find(p=>p.id===Number(share.dataset.copy));if(post&&navigator.clipboard){navigator.clipboard.writeText(post.text).then(()=>toast("Post copied to clipboard.")).catch(()=>toast("Clipboard access unavailable."))}else toast("Sharing is unavailable in this browser.")}});
function openProfile(){$("#profileDialog").showModal()}
$("#editProfileBtn").addEventListener("click",openProfile);$("#topProfileBtn").addEventListener("click",openProfile);$("#cancelProfile").addEventListener("click",()=>$("#profileDialog").close());
$("#profileForm").addEventListener("submit",e=>{e.preventDefault();profile={name:$("#nameInput").value.trim()||"Student",course:$("#courseInput").value.trim()};write(STORAGE.profile,profile);renderProfile();$("#profileDialog").close();toast("Profile updated.")});
$("#notificationBtn").addEventListener("click",()=>toast("You’re all caught up. Check the events board for what’s next!"));
$("#todayDate").textContent=new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
renderAll();navigateFromHash();
