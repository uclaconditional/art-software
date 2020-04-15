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
