document.addEventListener('DOMContentLoaded', function () {
    const tocToggle = document.getElementById('tocToggle');
    const tocList = document.getElementById('tocList');
    const tocExpanders = document.querySelectorAll('.toc-expand');

    tocToggle.addEventListener('click', function () {
        tocList.classList.toggle('collapsed');
        tocToggle.classList.toggle('collapsed');
    });

    tocExpanders.forEach(expander => {
        expander.addEventListener('click', function () {
            const parentLi = this.parentElement;
            const sublist = parentLi.querySelector('.toc-sublist');
            
            if (sublist) {
                sublist.classList.toggle('active');
                this.classList.toggle('expanded');
            }
        });
    });

    const firstExpander = document.querySelector('.toc-expand');
    if (firstExpander) {
        const firstParentLi = firstExpander.parentElement;
        const firstSublist = firstParentLi.querySelector('.toc-sublist');
        if (firstSublist) {
            firstSublist.classList.add('active');
            firstExpander.classList.add('expanded');
        }
    }
});