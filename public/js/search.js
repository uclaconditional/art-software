$(document).ready(() => {

});


function submit() {
  console.log('submit')
  $.post('/search', $('form').serialize(), (res) => {
    console.log(res);
    $('#results').html(res.map(project).join(''));
  })
}


const project = ({ name, title, tags, files, alt }) => `
  <div>${name}</div>
  <div>${title}</div>
  <div>${tags}</div>
  <img src="${files[0].path}" alt="${alt}">
`;