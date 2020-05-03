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
    console.log(res);
    if (res.length) {
      $('#results').html(res.map(project).join(''));
    } else {
      $('#results').html('No results found.');
    }
    $('#results-section').show();
    $('#pdf-section').show();
  })
}

const project = data => {
  let elt = $('<div id="${data._id}" class="work"></div>');
  for (p in data) {
    if (p !== 'works')
      elt.append('<div id="'+p+'">'+p+': '+data[p]+'</div>');
  }
  for (w in data.works) {
    elt.append('<br>');
    for (p in data.works[w]) {
      elt.append('<div id="'+p+'">'+p+': '+data.works[w][p]+'</div>');
    }
  }
  return elt[0].outerHTML;
};
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

