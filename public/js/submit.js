$(document).ready(() => {
  populateForm();
  $('#add-work').click(addWork);

  const token = window.location.search.substring(1);
  if (token) {
    $.post('/account', {token: token}, (res) => {
      console.log(res)
      if (res.success) window.location = '/submit'
      else displayError(res);
    });
  } else {
    $.get('/authenticated', (res) => {
      console.log(res)
      if (res.success) displayForm(res);
      else window.location = '/magic';
    });
  }

});

const submit = () => {
  if (!validate()) return false;
  $('form').hide();
  $('#uploading').show();
  let formData = new FormData($('form')[0]);
  console.log(formData)
  $.ajax({
    type: 'POST',
    url: '/upload',
    data: formData,
    processData: false,
    contentType: false,
    success: (res) => {
      console.log(res);
      $('#uploading').hide();
      $('#thankyou').show();
    }
  })
};

const displayForm = (res) => {
  $('#artist-email').val(res.email);
  $('#sorry').hide();
  $('#form').show();

  // look up exisiting entries
  $.post('/search', {'artist-email': res.email}, (res) => {
    console.log(res);
    if (res.length) {
      let entry = res[0]; // todo: show multiple entries?
      for (prop in entry) {
        $('#'+prop).val(entry[prop]);
      }
    }
  });
};

const displayError = () => {
  $('#sorry').show();
};

const validate = () => {
  let errors = [];
  $('form input').each(function() {
    let label = $("label[for='" + $(this).attr('id') + "']");
    if (!$(this).val() && label.data('required')) errors.push(label.text());
  });
  $('form textarea').each(function() {
    let label = $("label[for='" + $(this).attr('id') + "']");
    if (!$(this).val() && label.data('required')) errors.push(label.text());
  });
  if (!errors.length) return true;
  else {
    alert('Please fill in the following:\n'+errors.join('\n'));
    return false;
  }
}

const addWork = data => {
  console.log('addwork')
  data['index'] = 'w'+$('.work').length;
  $('#works').append(workTemplate(data));
  populateWork(data['index']);
}

const workTemplate = data => `
<div class='work' id='${data['index']}'>
  <label for="${data['index']}-work-title" data-required="true">Work Title:</label>
  <input type="text" id="${data['index']}-work-title" name="${data['index']}-work-title" value="${data['title']}">

  <label for="${data['index']}-work-date" data-required="true">Date Work Completed:</label>
  <input type="number" id="${data['index']}-work-date" name="${data['index']}-work-date">

  <label for="${data['index']}-work-description" data-required="true">Work Description:</label>
  <textarea type="text" id="${data['index']}-work-description" name="${data['index']}-work-description"></textarea>

  <label for="${data['index']}-work-credits">Work Credits:</label>
  <textarea type="text" id="${data['index']}-work-credits" name="${data['index']}-work-credits"></textarea>

  <label for="${data['index']}-work-city" data-required="true">Primary City Where Work Was Created:</label>
  <input type="number" id="${data['index']}-work-city" name="${data['index']}-work-city">

  <label for="${data['index']}-work-image">Work Image:</label>
  <input type="file" id="${data['index']}-work-image" name="${data['index']}-work-image" multiple />

  <label for="${data['index']}-work-video">Work Video:</label>
  <input type="file" id="${data['index']}-work-video" name="${data['index']}-work-video" />

  <label for="${data['index']}-work-alt">Work Alt Text:</label>
  <textarea type="text" id="${data['index']}-work-alt" name="${data['index']}-work-alt"></textarea>

  <label for="${data['index']}-work-categories">Work Categories:</label>
  <select id="${data['index']}-work-categories" name="${data['index']}-work-categories" multiple></select>

  <label for="${data['index']}-work-software">Work Software:</label>
  <select id="${data['index']}-work-software" name="${data['index']}-work-software" multiple></select>

  <label for="${data['index']}-work-code">Work Code:</label>
  <select id="${data['index']}-work-code" name="${data['index']}-work-code" multiple></select>

  <label for="${data['index']}-work-codesnippet">Code Snippet:</label>
  <textarea type="text" id="${data['index']}-work-codesnippet" name="${data['index']}-work-codesnippet"></textarea>

  <label for="${data['index']}-work-interview-q1" data-required="true">Work Interview Question 1?</label>
  <textarea type="text" id="${data['index']}-work-interview-q1" name="${data['index']}-work-interview-q1"></textarea>

  <label for="${data['index']}-work-interview-q2" data-required="true">Work Interview Question 2?</label>
  <textarea type="text" id="${data['index']}-work-interview-q2" name="${data['index']}-work-interview-q2"></textarea>

  <label for="${data['index']}-work-interview-q3" data-required="true">Work Interview Question 3?</label>
  <textarea type="text" id="${data['index']}-work-interview-q3" name="${data['index']}-work-interview-q3"></textarea>

  <label for="${data['index']}-work-interview-q4" data-required="true">Work Interview Question 4?</label>
  <textarea type="text" id="${data['index']}-work-interview-q4" name="${data['index']}-work-interview-q4"></textarea>
</div>
`;