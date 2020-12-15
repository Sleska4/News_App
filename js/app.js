// Модуль
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}

const http = customHttp();


const service = (function (){
  const apiKey = '5205778383d44f128dba9905d4942acd';
  const apiUrl = 'https://news-api-v2.herokuapp.com';
  return {
    topHead(country = 'ru', category = '', cb){
      if(category){
        http.get(`${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,
            cb)
      } else {
        http.get(`${apiUrl}/top-headlines?country=${country}&apiKey=${apiKey}`,
      cb)}
    },
    everything(country, input, cb){
      http.get(`${apiUrl}/everything?&language=${country}&q=${input}&apiKey=${apiKey}`,
      cb)
    }
  }
})

const forms = document.forms['newsControls'];
const countrySelector = forms.elements['country'];
const searchInput = forms.elements['search'];
const category = forms.elements['category'];

forms.addEventListener('submit', (e) => {
  e.preventDefault();
  loadNews()
})


//  Что-то из библиотеки
document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
  loadNews()
});


//  Загрузка новостей и определение их типа
function loadNews(){
  preloader()
  const country = countrySelector.value;
  const searchText = searchInput.value;
  const categoryValue = category.value;

  if(!searchText) {
    service().topHead(country, categoryValue, onGetResponse);
  } else {
    service().everything(country, searchText, onGetResponse);
  }
}


//  Отлов ошибок
function onGetResponse(error, res){
  if(error){
    M.toast({html: error, classes: 'err'});
    return
  }

  if(!res.articles.length){


    alert('Новостей нет!');
    removeLoader()
    return;
  }
  renderNews(res.articles);
}


function renderNews(news){
  const container = document.querySelector('.news-container');
  container.innerHTML = '';
  let fragment = '';

  news.forEach(el => {
    const element = newsTemplate(el);
    fragment += element;
  })
  container.insertAdjacentHTML("afterbegin", fragment);
  removeLoader()
}


//  Шаблон новостей
function newsTemplate({urlToImage, title, url, description, source:{name}}){
  return `
    <div class="col-md-6">
        <div class="card content">
            <div class="card-image">
                <img src="${urlToImage}" class="content-img" alt='${name}'>
                <span class="card-title">${title || ''}</span>
        </div>
        <div class="card-content">
          <p class="card-text">${description || ''}</p>
        </div>
        <div class="card-action">
            <a href="${url}">Read more</a>
        </div>
      </div>
    </div>`;
}


//  preloader
function preloader(){
  document.body.insertAdjacentHTML('afterbegin',
      '<div class="progress">\n' +
      '      <div class="indeterminate"></div>\n' +
      '  </div>')
}


function removeLoader(){
  const load = document.querySelector('.progress');
  if(load){
    load.remove()
  }
}