lucide.createIcons();

const modal=document.getElementById('successModal');
const closeBtn=document.getElementById('modalClose');
const uploadBtn=document.getElementById('uploadAnotherBtn');
const browseBtn=document.getElementById('browseNotesBtn');

function showSuccessModal({
title='🎉 Note Submitted Successfully!',
message='Your note has been submitted successfully and is pending admin review. It will become visible after approval.',
browseUrl='/pages/browse.html',
onUploadAnother=null
}={}){

document.getElementById('modalTitle').textContent=title;
document.getElementById('modalMessage').textContent=message;

modal.classList.add('active');
modal.setAttribute('aria-hidden','false');
document.body.style.overflow='hidden';

uploadBtn.onclick=()=>{
hideSuccessModal();
if(onUploadAnother) onUploadAnother();
};

browseBtn.onclick=()=>window.location.href=browseUrl;
}

function hideSuccessModal(){
modal.classList.remove('active');
modal.setAttribute('aria-hidden','true');
document.body.style.overflow='';
}

closeBtn.addEventListener('click',hideSuccessModal);

modal.addEventListener('click',e=>{
if(e.target===modal) hideSuccessModal();
});

document.addEventListener('keydown',e=>{
if(e.key==='Escape') hideSuccessModal();
});

/* Usage:

showSuccessModal({
    onUploadAnother:()=>{
        uploadForm.reset();
        removeFile();
        document.getElementById('title').focus();
    },
    browseUrl:'/pages/browse.html'
});

*/
