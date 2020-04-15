$(document).ready(() => {
  populateForm();
});



function submit() {
  $('form').hide();
  $('#uploading').show();
  let formData =new FormData($('form')[0]);// $('form').serialize();

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
}


function populateForm() {
  $.get('/metadata', (data) => {
    data.categories.forEach(c => {
      $('#work-categories').append('<option value="'+c+'">'+c+'</option>');
    });
  });
}