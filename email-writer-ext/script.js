document.addEventListener('scroll', function()
{
    let scrollPosition=window.scrollY;
    document.querySelector('.scroll-icon').style.transform=`translateY(${scrollPosition}px)`;
    document.querySelector('.scroll-icon-mail').style.transform=`translateY(${scrollPosition}px)`;
});