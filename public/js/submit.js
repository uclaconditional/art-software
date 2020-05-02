$(document).ready(() => {
  populateForm();

  const token = window.location.search.substring(1);
  $.post('/account', {token: token}, (res) => {
    console.log(res)
    if (res.success) {
      $('#artist-email').val(res.email);
      $('#form').show();
    }
    else if (res.error) {
      $('#sorry').show();
    }
  });
});

function submit() {
  $('form').hide();
  $('#uploading').show();
  let formData =new FormData($('form')[0]);

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
