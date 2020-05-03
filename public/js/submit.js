const init = () => {
  populateForm();
  $('#add-work').click(addWork);
  $('#works').sortable({
    update: reorderWorks
  });

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
};

const submit = () => {
  if (!validate()) return false;
  $('form').hide();
  $('#uploading').show();

  let data = { works: [] };
  $('#artist-data').find('input, textarea, select').each(function() {
    if ($(this).attr('type') !== 'file') {
      let prop = $(this).attr('id');
      let val = $(this).val();
      if (prop.includes('json') && val.length) val = JSON.parse(val);
      data[prop] = val;
    }
  });

  $('#works li').each(function() {
    $(this).find('input, textarea, select').each(function() {
      let prop = $(this).attr('id');
      let n = Number(prop[1]);
      let i = $('#w'+n+'-work-order').val();
      let val = $(this).val();
      if (prop.includes('json') && val.length) val = JSON.parse(val);
      if (!data.works[i]) data.works[i] = {};
      data.works[i][prop.substring(3)] = val;
    });
  });
  console.log(data);

  $.post('/submit', data, (res) => {
    console.log(res);
    $('#uploading').hide();
    $('#thankyou').show();
  });
};

const displayForm = (res) => {
  $('#artist-email').val(res.email);
  $('#sorry').hide();
  $('#form').show();

  // look up exisiting entries
  $.post('/search', {'artist-email': res.email}, (res) => {
    if (res.length) {
      populateEntry(res[0]); // todo: show multiple entries?
    } else addWork();
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
  let index = 'w'+$('.work').length;
  $('#works').append(workTemplate(index, data));
  populateWork(index);

  for (prop in data) {
    if (Array.isArray(data[prop])) {
      console.log(data[prop]);
      let id = '#'+index+'-'+prop;
      for (item of data[prop]) {
        $(id+" option[value='" + item + "']").prop("selected", true);
      }
    }
  } 

  $('#'+index+' .work-heading').click(toggleWork);
  reorderWorks();
}

const workTemplate = (index, data) => `
<li class='work' id='${index}'>

  <div class='work-heading'>
  <label for="${index}-work-title" data-required="true">Work Title:</label>
  <input type="text" id="${index}-work-title" name="${index}-work-title" value="${data['work-title']}">
  
  <input type="number" id="${index}-work-order" name="${index}-work-order" class='work-order hidden'>
  </div>

  <div class='work-contents'>
  <label for="${index}-work-year" data-required="true">Year Work Completed:</label>
  <input type="number" id="${index}-work-year" name="${index}-work-year" value="${data['work-year'] ? data['work-year'] : ''}">

  <label for="${index}-work-description" data-required="true">Work Description:</label>
  <textarea type="text" id="${index}-work-description" name="${index}-work-description">${data['work-description'] ? data['work-description'] : ''}</textarea>

  <label for="${index}-work-credits" data-required="true">Work Credits:</label>
  <textarea type="text" id="${index}-work-credits" name="${index}-work-credits">${data['work-credits'] ? data['work-credits'] : ''}</textarea>

  <label for="${index}-work-city">Primary City Where Work Was Created:</label>
  <input type="text" id="${index}-work-city" name="${index}-work-city" value=${data['work-city'] ? data['work-city'] : ''}>

  <label for="${index}-work-image">Work Image:</label>
  <input type="file" id="${index}-work-image" name="${index}-work-image" accept="image/*" onchange="handleFiles(this.id, this.files)">
  <textarea type="text" id="${index}-work-image-json" name="${index}-work-image-json" readonly class="hidden">${JSON.stringify(data['work-image-json'])}</textarea>
  <img id="${index}-work-image-preview" src="${data['work-image-json'].path}">

  <label for="${index}-work-video">Work Video:</label>
  <input type="file" id="${index}-work-video" name="${index}-work-video">

  <label for="${index}-work-alt">Work Alt Text:</label>
  <textarea type="text" id="${index}-work-alt" name="${index}-work-alt">${data['work-alt'] ? data['work-alt'] : ''}</textarea>

  <label for="${index}-work-categories">Work Categories:</label>
  <select id="${index}-work-categories" name="${index}-work-categories" multiple></select>

  <label for="${index}-work-software">Work Software:</label>
  <select id="${index}-work-software" name="${index}-work-software" multiple></select>

  <label for="${index}-work-code">Work Code:</label>
  <select id="${index}-work-code" name="${index}-work-code" multiple></select>

  <label for="${index}-work-codesnippet">Code Snippet:</label>
  <textarea type="text" id="${index}-work-codesnippet" name="${index}-work-codesnippet">${data['work-codesnippet'] ? data['work-codesnippet'] : ''}</textarea>

  <label for="${index}-work-interview-q1" data-required="true">Work Interview Question 1?</label>
  <textarea type="text" id="${index}-work-interview-q1" name="${index}-work-interview-q1">${data['work-interview-q1'] ? data['work-interview-q1'] : ''}</textarea>

  <label for="${index}-work-interview-q2" data-required="true">Work Interview Question 2?</label>
  <textarea type="text" id="${index}-work-interview-q2" name="${index}-work-interview-q2">${data['work-interview-q2'] ? data['work-interview-q2'] : ''}</textarea>

  <label for="${index}-work-interview-q3" data-required="true">Work Interview Question 3?</label>
  <textarea type="text" id="${index}-work-interview-q3" name="${index}-work-interview-q3">${data['work-interview-q3'] ? data['work-interview-q3'] : ''}</textarea>

  <label for="${index}-work-interview-q4" data-required="true">Work Interview Question 4?</label>
  <textarea type="text" id="${index}-work-interview-q4" name="${index}-work-interview-q4">${data['work-interview-q4'] ? data['work-interview-q4'] : ''}</textarea>
  </div>
</li>
`;

const populateEntry = entry => {
  for (p in entry) {
    if (entry[p].fieldname) {
      $('#'+entry[p].fieldname+'-json').val(JSON.stringify(entry[p])); // pend
      $('#'+entry[p].fieldname+'-preview').attr('src', entry[p].path);
    } else {
      $('#'+p).val(entry[p]);
    }
  }
  for (w in entry.works) {
    addWork(entry.works[w]);
  }
};

function toggleWork() {
  let contents = $(this).parent().find('.work-contents')[0];
  if ($(contents).is(":hidden")) $(contents).show();
  else $(contents).hide();
}

const reorderWorks = () => {
  let i = 0;
  $('#works li').each(function() {
    $(this).find('.work-order')[0].value = i;
    i++;
  });
}


const handleFiles = (prop, files) =>{
  let fd = new FormData();
  fd.append(prop,files[0]);
  $.ajax({
    type: 'POST',
    url: '/upload',
    data: fd,
    processData: false,
    contentType: false,
    success: (res) => {
      console.log(res);
      if (res.length && res[0].fieldname) {
        $('#'+res[0].fieldname+'-preview').attr('src', res[0].path);
        $('#'+res[0].fieldname+'-json').val(JSON.stringify(res[0]));
      }
    }
  })
};