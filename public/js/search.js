import { ObjectId } from "mongodb";

let data;

$(document).ready(() => {
  populateForm();
  $('#pdf').click(exportPDF);
});

const submit = () => {
  console.log('submit')
  $.post('/search', $('form').serialize(), (res) => {
  // $.post('/search', {'_id': ObjectId('5e9656a809b1a709bd28dfc9')}, (res) => {
    data = res;
    if (res.length) {
      $('#results').html(res.map(project).join(''));
    } else {
      $('#results').html('No results found.');
    }
    $('#results-section').show();
    $('#pdf-section').show();
  })
}

const project = data => `
<div id="${data._id}" class="work">
  <div>${data['artist-name']}</div>
  <div><a href="mailto:${data['artist-email']}">${data['artist-email']}</a></div>
  <div><a href="${data['artist-url']}">${data['artist-url']}</a></div>
  <div>${data['artist-bio']}</div>
  <div>${data['artist-country-residence']}</div>
  <div>${data['artist-country-birth']}</div>
  <div>${data['artist-year-birth']}</div>
  <div>${data['artist-gender']}</div>
  <div>${data['title']}</div>
  <div>${data['year']}</div>
  <div>${data['description']}</div>
  <div>${data['categories']}</div>
</div>
`;
// <img src="${data.files[0].path}" alt="${data['alt']}">
const exportPDF = () => {
  if (!data) return;
  let doc = new jsPDF();
  doc.setFontSize(10);
  doc.setFont('courier');
  doc.deletePage(1);
  data.forEach(work => {
    doc.addPage('letter', 'portrait');
    let y = 20;
    for (const prop in work) {
      if (work[prop] && prop !== 'files' && prop !== '_id' && prop !== 'timestamp') {
        doc.text(20, y, work[prop]);
        y += 5;
      }
    }
    let img = $('#'+work._id+' img');
    doc.addImage(img[0], 'JPEG', 20, y+5, 50, 50*img.height()/img.width());
  });
  doc.save('Test.pdf');
}

