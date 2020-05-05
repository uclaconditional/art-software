
const init = () => {

}

const submit = () => {
  console.log('submit')
  $('form').hide();
  $('#thankyou').show();
  $.post('/login', $('form').serialize(), (res) => {
    console.log(res)
  })
}
