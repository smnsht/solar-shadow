function component() {
	const element = document.createElement('div');
  
	element.innerHTML = 'This is Foo!';
  
	return element;
  }
  
  document.body.appendChild(component());
