let data;

$(document).ready(() => {
  $('#pdf').click(exportPDF);
  populateForm();
});

function populateForm() {
  $.get('/metadata', (data) => {
    data.categories.forEach(c => {
      $('#work-categories').append('<option value="'+c+'">'+c+'</option>');
    });
  });
}

function submit() {
  console.log('submit')
  $.post('/search', $('form').serialize(), (res) => {
    console.log(res);
    data = res;
    $('#results').html(res.map(project).join(''));
  })
}

const project = ({ _id, name, title, tags, files, alt }) => `
<div id="${_id}">
  <div>${name}</div>
  <div>${title}</div>
  <div>${tags}</div>
  <img src="${files[0].path}" alt="${alt}">
</div>
`;

const exportPDF = () => {
  if (!data) return;
  let doc = new jsPDF();
  doc.deletePage(1);
  data.forEach((project) => {
    doc.addPage('letter', 'portrait');
    doc.text(20, 20, project.name);
    doc.text(20, 60, project.title);
    let img = $('#'+project._id+' img');
    doc.addImage(img[0], 'JPEG', 20, 100, 100, 100);
  });
  doc.save('Test.pdf');
}

