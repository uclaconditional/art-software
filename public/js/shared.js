let metadata;

$(document).ready(() => {
  populateForm();
});

const populateForm = () => {
  $.get('/metadata', (data) => {
    metadata = data;
   init();

    metadata.countries.forEach(c => {
      $('#artist-country-residence').append('<option value="'+c+'">'+c+'</option>');
      $('#artist-country-birth').append('<option value="'+c+'">'+c+'</option>');
    });
    metadata.genders.forEach(c => {
      $('#artist-gender').append('<option value="'+c+'">'+c+'</option>');
    });
    metadata.categories.forEach(c => {
      $('#work-categories').append('<option value="'+c+'">'+c+'</option>');
    });
    metadata.software.forEach(c => {
      $('#work-software').append('<option value="'+c+'">'+c+'</option>');
    });
    metadata.code.forEach(c => {
      $('#work-code').append('<option value="'+c+'">'+c+'</option>');
    });
  });
};

const populateWork = (ind) => {
  metadata.categories.forEach(c => {
    $('#'+ind+'-work-categories').append('<option value="'+c+'">'+c+'</option>');
  });
  metadata.software.forEach(c => {
    $('#'+ind+'-work-software').append('<option value="'+c+'">'+c+'</option>');
  });
  metadata.code.forEach(c => {
    $('#'+ind+'-work-code').append('<option value="'+c+'">'+c+'</option>');
  });
}
