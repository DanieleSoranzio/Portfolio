  // click a gallery thumbnail to open it larger, in front of the page
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');

  function openLightbox(img){
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('active');
  }
  function closeLightbox(){
    lightbox.classList.remove('active');
  }

  document.querySelectorAll('.g-item').forEach(function(item){
    item.addEventListener('click', () => openLightbox(item.querySelector('img')));
  });

  // click anywhere on the backdrop (or the image itself) closes it
  lightbox.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });