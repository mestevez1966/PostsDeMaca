/**
 * Main JS file for theme behaviours
 */

const observer = lozad();
observer.observe();

$('p').each(function(){
   $(this).html( $(this).html().replace(/((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g, '<a href="$1">$1</a> ') );
});

$('p').each(function(){
   $(this).html( $(this).html().replace(/#(\S*)/g,'<a href="https://www.linkedin.com/feed/hashtag/?keywords=$1">#$1</a>') );
});

$(document).ready(function(){
    $(window).scroll(function() {
        //check if your div is visible to user
        // CODE ONLY CHECKS VISIBILITY FROM TOP OF THE PAGE
        if ($(window).scrollTop() + $(window).height() >= $('.b').offset().top) {
            if(!$('.b').attr('loaded')) {
                //not in ajax.success due to multiple sroll events
                $('.b').attr('loaded', true);

                //ajax goes here
                //in theory, this code still may be called several times
            }
        }
    });
});
 
// Responsive video embeds

// Handle main navigation menu toggling on small screens
function menuToggleHandler(e) {
  e.preventDefault();
  document.body.classList.toggle('menu--opened');
}

// Handle docs navigation menu toggling on small screens
function docsNavToggleHandler(e) {
  e.preventDefault();
  document.body.classList.toggle('docs-menu--opened');
}

// Handle submenu toggling
function submenuToggleHandler(e) {
  e.preventDefault();
  this.parentNode.classList.toggle('active');
}

window.addMainNavigationHandlers = function() {
  const menuToggle = document.querySelectorAll('.menu-toggle');
  if (menuToggle) {
    for (let i = 0; i < menuToggle.length; i++) {
      menuToggle[i].addEventListener('click', menuToggleHandler, false);
    }
  }

  const submenuToggle = document.querySelectorAll('.submenu-toggle');
  if (submenuToggle) {
    for (let i = 0; i < submenuToggle.length; i++) {
      submenuToggle[i].addEventListener('click', submenuToggleHandler, false);
    }
  }
};

window.removeMainNavigationHandlers = function() {
  // Remove nav related classes on page load
  document.body.classList.remove('menu--opened');

  const menuToggle = document.querySelectorAll('.menu-toggle');
  if (menuToggle) {
    for (let i = 0; i < menuToggle.length; i++) {
      menuToggle[i].removeEventListener('click', menuToggleHandler, false);
    }
  }

  const submenuToggle = document.querySelectorAll('.submenu-toggle');
  if (submenuToggle) {
    for (let i = 0; i < submenuToggle.length; i++) {
      submenuToggle[i].removeEventListener('click', submenuToggleHandler, false);
    }
  }
};

window.addDocsNavigationHandlers = function() {
  const docsNavToggle = document.getElementById('docs-nav-toggle');
  if (docsNavToggle) {
    docsNavToggle.addEventListener('click', docsNavToggleHandler, false);
  }

  const docsSubmenuToggle = document.querySelectorAll('.docs-submenu-toggle');
  if (docsSubmenuToggle) {
    for (let i = 0; i < docsSubmenuToggle.length; i++) {
      docsSubmenuToggle[i].addEventListener('click', submenuToggleHandler, false);
    }
  }
};

window.removeDocsNavigationHandlers = function() {
  // Remove docs nav related classes on page load
  document.body.classList.remove('docs-menu--opened');

  const docsNavToggle = document.getElementById('docs-nav-toggle');
  if (docsNavToggle) {
    docsNavToggle.removeEventListener('click', docsNavToggleHandler, false);
  }

  const docsSubmenuToggle = document.querySelectorAll('.docs-submenu-toggle');
  if (docsSubmenuToggle) {
    for (let i = 0; i < docsSubmenuToggle.length; i++) {
      docsSubmenuToggle[i].removeEventListener('click', submenuToggleHandler, false);
    }
  }
};

window.addPageNavLinks = function() {
  const pageToc = document.getElementById('page-nav-inside');
  const pageTocContainer = document.getElementById('page-nav-link-container');

  if (pageToc && pageTocContainer) {
    const pageContent = document.querySelector('.type-docs .post-content');

    // Create in-page navigation
    const headerLinks = getHeaderLinks({
      root: pageContent
    });
    if (headerLinks.length > 0) {
      pageToc.classList.add('has-links');
      renderHeaderLinks(pageTocContainer, headerLinks);
    }

    // Scroll to anchors
    let scroll = new SmoothScroll('[data-scroll]');
    let hash = window.decodeURI(location.hash.replace('#', ''));
    if (hash !== '') {
      window.setTimeout( function(){
        let anchor = document.getElementById(hash);
        if (anchor) {
          scroll.animateScroll(anchor);
        }
      }, 0);
    }

    // Highlight current anchor
    let pageTocLinks = pageTocContainer.getElementsByTagName('a');
    if (pageTocLinks.length > 0) {
      let spy = new Gumshoe('#page-nav-inside a', {
        nested: true,
        nestedClass: 'active-parent'
      });
    }

    // Add link to page content headings
    let pageHeadings = getElementsByTagNames(pageContent, ["h2", "h3"]);
    for (let i = 0; i < pageHeadings.length; i++) {
      let heading = pageHeadings[i];
      if (typeof heading.id !== "undefined" && heading.id !== "") {
        heading.insertBefore(anchorForId(heading.id), heading.firstChild);
      }
    }

    // Copy link url
    let clipboard = new ClipboardJS('.hash-link', {
      text: function(trigger) {
        return window.location.href.replace(window.location.hash,"") + trigger.getAttribute('href');
      }
    });
  }
}

window.removePageNavLinks = function() {
  const pageToc = document.getElementById('page-nav-inside');
  const pageTocContainer = document.getElementById('page-nav-link-container');

  if (pageToc && pageTocContainer) {
    pageToc.classList.remove('has-links');
    while (pageTocContainer.firstChild) {
      pageTocContainer.removeChild(pageTocContainer.firstChild);
    }
  }
}

function getElementsByTagNames(root, tagNames) {
  let elements = [];
  for (let i = 0; i < root.children.length; i++) {
    let element = root.children[i];
    let tagName = element.nodeName.toLowerCase();
    if (tagNames.includes(tagName)) {
      elements.push(element);
    }
    elements = elements.concat(getElementsByTagNames(element, tagNames));
  }
  return elements;
}

function createLinksForHeaderElements(elements) {
  let result = [];
  let stack = [
    {
      level: 0,
      children: result
    }
  ];
  let re = /^h(\d)$/;
  for (let i = 0; i < elements.length; i++) {
    let element = elements[i];
    let tagName = element.nodeName.toLowerCase();
    let match = re.exec(tagName);
    if (!match) {
      console.warn("can not create links to non header element");
      continue;
    }
    let headerLevel = parseInt(match[1], 10);
    if (!element.id) {
      if (!element.textContent) {
        console.warn(
          "can not create link to element without id and without text content"
        );
        continue;
      }
      element.id = element.textContent
        .toLowerCase()
        .replace(/[^\w]+/g, "_")
        .replace(/^_/, "")
        .replace(/_$/, "");
    }
    let link = document.createElement("a");
    link.href = "#" + element.id;
    link.setAttribute('data-scroll', '');
    link.appendChild(document.createTextNode(element.textContent));
    let obj = {
      id: element.id,
      level: headerLevel,
      textContent: element.textContent,
      element: element,
      link: link,
      children: []
    };
    if (headerLevel > stack[stack.length - 1].level) {
      stack[stack.length - 1].children.push(obj);
      stack.push(obj);
    } else {
      while (headerLevel <= stack[stack.length - 1].level && stack.length > 1) {
        stack.pop();
      }
      stack[stack.length - 1].children.push(obj);
      stack.push(obj);
    }
  }
  return result;
}

function getHeaderLinks(options = {}) {
  let tagNames = options.tagNames || ["h2", "h3"];
  let root = options.root || document.body;
  let headerElements = getElementsByTagNames(root, tagNames);
  return createLinksForHeaderElements(headerElements);
}

function renderHeaderLinks(element, links) {
  if (links.length === 0) {
    return;
  }
  let ulElm = document.createElement("ul");
  for (let i = 0; i < links.length; i++) {
    let liElm = document.createElement("li");
    liElm.append(links[i].link);
    if (links[i].children.length > 0) {
      renderHeaderLinks(liElm, links[i].children);
    }
    ulElm.appendChild(liElm);
  }
  element.appendChild(ulElm);
}

function anchorForId(id) {
  let anchor = document.createElement("a");
  anchor.setAttribute("class", "hash-link");
  anchor.setAttribute("data-scroll", "");
  anchor.href = "#" + id;
  anchor.innerHTML = '<span class="screen-reader-text">Copy</span>';
  return anchor;
}

// Syntax Highlighter
// Prism.highlightAll();



//Shuffle.js
var Shuffle = window.Shuffle;

class Demo {
  constructor(element) {
    this.element = element;
    this.shuffle = new Shuffle(element, {
      itemSelector: '.b',
      sizer: element.querySelector('.my-sizer-element'),
      speed: 0,
      easing: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
    });

    // Log events.
    //this.addShuffleEventListeners();
    this._activeFilters = [];
    this.addFilterButtons();
    this.addSorting();
    this.addSearchFilter();
  }

  /**
   * Shuffle uses the CustomEvent constructor to dispatch events. You can listen
   * for them like you normally would (with jQuery for example).
   
  addShuffleEventListeners() {
    this.shuffle.on(Shuffle.EventType.LAYOUT, (data) => {
      console.log('layout. data:', data);
    });
    this.shuffle.on(Shuffle.EventType.REMOVED, (data) => {
      console.log('removed. data:', data);
    });
  }*/

  addFilterButtons() {
    const options = document.querySelector('.filter-options');
    if (!options) {
      return;
    }
    
    const filterButtons = Array.from(options.children);
    const onClick = this._handleFilterClick.bind(this);
    
   for (let i = 0; i < filterButtons.length; i++) {
     
     if(i === 0){
       filterButtons[i].addEventListener('click', onClick, false);
     } else {
       filterButtons[i].addEventListener('click', onClick, false);
     }
 
  } 

  }

  _handleFilterClick(evt) {
    const btn = evt.currentTarget;
    const isActive = btn.classList.contains('active');
    const btnGroup = btn.getAttribute('data-group');
    
    this._removeActiveClassFromChildren(btn.parentNode);
    
    let filterGroup;
    if (isActive) {
      btn.classList.remove('active');
      filterGroup = Shuffle.ALL_ITEMS;
    } else {
      btn.classList.add('active');
      filterGroup = btnGroup;
    }
    
    this.shuffle.filter(filterGroup);
  }

  _removeActiveClassFromChildren(parent) {
    const { children } = parent;
    for (let i = children.length - 1; i >= 0; i--) {
      children[i].classList.remove('active');
    }
  }

  addSorting() {
    const buttonGroup = document.querySelector('.sort-options');
    if (!buttonGroup) {
      return;
    }
    buttonGroup.addEventListener('change', this._handleSortChange.bind(this));
  }

  _handleSortChange(evt) {
    // Add and remove `active` class from buttons.
    const buttons = Array.from(evt.currentTarget.children);
    buttons.forEach((button) => {
      if (button.querySelector('input').value === evt.target.value) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
    
    // Create the sort options to give to Shuffle.
    const { value } = evt.target;
    let options = {};
    
    function sortByDate(element) {
      return element.getAttribute('dc');
    }
    
    function sortByTitle(element) {
      return element.getAttribute('dc');
    }
    
    if (value === 'date-created') {
      options = {
        reverse: true,
        by: sortByDate,
      };
    } else if (value === 'date-created2') {
      options = {
        reverse: false,
        by: sortByTitle,
      };
    }
    this.shuffle.sort(options);
  }

  // Advanced filtering
  addSearchFilter() {
    const searchInput = document.querySelector('.js-shuffle-search');
    if (!searchInput) {
      return;
    }
    searchInput.addEventListener('keyup', this._handleSearchKeyup.bind(this));
  }

  /**
   * Filter the shuffle instance by items with a title that matches the search input.
   * @param {Event} evt Event object.
   */
  _handleSearchKeyup(evt) {
    const searchText = evt.target.value.toLowerCase();
    this.shuffle.filter((element, shuffle) => {
      // If there is a current filter applied, ignore elements that don't match it.
      if (shuffle.group !== Shuffle.ALL_ITEMS) {
        // Get the item's groups.
        const groups = JSON.parse(element.getAttribute('data-groups'));
        const isElementInCurrentGroup = groups.indexOf(shuffle.group) !== -1;
        console.log(groups);
        // Only search elements in the current group
        if (!isElementInCurrentGroup) {
          return false;
        }
      }
      const titleElement = element.querySelector('.k');
      const titleText = titleElement.textContent.toLowerCase().trim();
      return titleText.indexOf(searchText) !== -1;
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.demo = new Demo(document.getElementById('g'));
});

//Get the button
var btn = $('#button');

$(window).scroll(function() {
  if ($(window).scrollTop() > 300) {
    btn.addClass('show');
  } else {
    btn.removeClass('show');
  }
});

btn.on('click', function(e) {
  e.preventDefault();
  $('html, body').animate({scrollTop:0}, '300');
});
