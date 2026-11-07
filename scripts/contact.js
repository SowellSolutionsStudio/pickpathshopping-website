(function () {
"use strict";
const email="info@pickpathshopping.com", form=document.getElementById("contact-email-composer");
if(!form)return;
const topic=document.getElementById("contact-subject"),name=document.getElementById("contact-name"),reply=document.getElementById("contact-reply"),message=document.getElementById("contact-message"),feedback=document.getElementById("contact-copy-feedback"),buttons=Array.from(document.querySelectorAll("[data-contact-topic]"));
function setTopic(value){topic.value=value;for(const button of buttons){const active=button.dataset.contactTopic===value;button.classList.toggle("is-active",active);button.setAttribute("aria-pressed",String(active));}}
for(const button of buttons)button.addEventListener("click",()=>{setTopic(button.dataset.contactTopic);document.getElementById("write-us").scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});});
topic.addEventListener("change",()=>setTopic(topic.value));
function draft(){return {subject:"PickPath Shopping: "+topic.value,body:[message.value.trim(),"","Name: "+(name.value.trim()||"Not provided"),"Preferred reply email: "+(reply.value.trim()||"Reply to sending address")].join("\n")};}
form.addEventListener("submit",event=>{event.preventDefault();if(!form.reportValidity())return;const d=draft();feedback.textContent="Your email app should open now. Review the message and press Send there.";window.location.href="mailto:"+email+"?subject="+encodeURIComponent(d.subject)+"&body="+encodeURIComponent(d.body);});
async function copy(value){try{if(!navigator.clipboard||!window.isSecureContext)return false;await navigator.clipboard.writeText(value);return true;}catch(_){return false;}}
document.querySelector("[data-contact-copy-email]")?.addEventListener("click",async event=>{const ok=await copy(email);event.currentTarget.textContent=ok?"✓ Email copied":"Copy this address: "+email;feedback.textContent=ok?"Email address copied!":"Copy this address: "+email;});
document.querySelector("[data-contact-copy-draft]")?.addEventListener("click",async event=>{if(!form.reportValidity())return;const d=draft();const ok=await copy("To: "+email+"\nSubject: "+d.subject+"\n\n"+d.body);event.currentTarget.textContent=ok?"✓ Message copied":"Copy message instead ⧉";feedback.textContent=ok?"Message copied! Paste it into your email app and send to "+email+".":"Copy isn't available here. Select your message above or use the email address on the left.";});
})();