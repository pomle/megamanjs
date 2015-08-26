var layers = [[]],
    selectedObject = undefined,
    activeLayer = layers[0];

$(function() {
    var workspace = $('.workspace');

    var renderer = new THREE.WebGLRenderer();
    var camera = new THREE.PerspectiveCamera(60, 1, 1, 100000);
    camera.position.z = 500;
    var scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff));

    workspace.append(renderer.domElement);

    function render()
    {
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    render();


    var modes = {
        edit: function(e) {
            if (selectedObject === undefined) {
                return;
            }

            var a = e.ctrlKey ? 1 : 16,
                p = selectedObject.position;
            switch (e.which) {
                case 9:
                    // TAB
                    break;
                case 38:
                    p.y += a;
                    break;
                case 40:
                    p.y -= a;
                    break;
                case 39:
                    p.x += a;
                    break;
                case 37:
                    p.x -= a;
                    break;
            }
        },
        view: function(e) {
            var p = camera.position,
                a = 64;

            switch (e.which) {
                case 107:
                    p.z /= 2;
                    break;
                case 109:
                    p.z *= 2;
                    break;

                case 38:
                    p.y += a;
                    break;
                case 40:
                    p.y -= a;
                    break;
                case 39:
                    p.x += a;
                    break;
                case 37:
                    p.x -= a;
                    break;
            }
        },
    }

    var activeMode = modes.view;

    $(window)
        .on('resize', function(e) {
            var w = workspace.width(),
                h = workspace.height();

            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }).trigger('resize');

    var geometryInput = '256x240/16';
    $(window).on('keydown', function(e) {
        e.preventDefault();
        console.log(e.which, e);
        switch (e.which) {
            case 9:

                activeMode = activeMode === modes.view ? modes.edit : modes.view;
                break;

            case 65:
                geometryInput = prompt('Size', geometryInput);
                var s = geometryInput.split('/')[0].split('x');
                var m = parseFloat(geometryInput.split('/')[1]) || 16;
                var size = {
                    x: parseFloat(s[0]),
                    y: parseFloat(s[1]),
                }
                size['sx'] = Math.ceil(size.x / m);
                size['sy'] = Math.ceil(size.y / m);

                console.log(size);
                var mesh = new THREE.Mesh(
                    new THREE.PlaneBufferGeometry(size.x, size.y, size.sx, size.sy),
                    new THREE.MeshBasicMaterial({color: 'blue', wireframe: true})
                );
                mesh.position.x = camera.position.x;
                mesh.position.y = camera.position.y;
                activeLayer.push(mesh);
                scene.add(mesh);
                selectedObject = mesh;
                break;

            default:
                activeMode(e);
                break;
        }
    });

    workspace.on('click', function(e) {
        var vector = new THREE.Vector3(0,0,0),
            raycaster = new THREE.Raycaster();

        vector.set((event.clientX / window.innerWidth) * 2 - 1,
                   -(event.clientY / window.innerHeight) * 2 + 1,
                   - 1 ); // z = - 1 important!

        vector.unproject(camera);
        raycaster.set(camera.position, vector.sub(camera.position).normalize());
        var intersects = raycaster.intersectObjects(activeLayer);

        if (intersects.length !== 0) {
            selectedObject = intersects[0].object;
            console.log(selectedObject);
        }
    });

    workspace.on('dragenter', function (e) {
        e.stopPropagation();
        e.preventDefault();
    });
    workspace.on('dragover', function (e) {
         e.stopPropagation();
         e.preventDefault();
    });
    workspace.on('drop', function (e) {
        e.preventDefault();
        if (selectedObject === undefined) {
            return;
        }
        var files = e.originalEvent.dataTransfer.files;
        var file = files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
            render(e.target.result);
            var i = new Image();
            i.src = e.target.result;
            var canvas = document.createElement('canvas');
            var texture = new THREE.Texture(canvas);
            texture.name = file.name;
            i.onload = function() {
                canvas.width = this.width;
                canvas.height = this.height;
                var ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, this.width, this.height);
                ctx.drawImage(this, 0, 0);
                texture.needUpdate = true;
            };
            selectedObject.material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
            });
            selectedObject.material.needUpdate = true;
        };
        reader.readAsDataURL(file);
    });
});

/*
    workspace.on('drop', function (e) {
        e.preventDefault();
        var files = e.originalEvent.dataTransfer.files;
        var file = files[0];
        canvas.data('url', file.name);
        var reader = new FileReader();
        reader.onload = function(e){
            render(e.target.result);
        };
        reader.readAsDataURL(file);
    });

    function render(src) {
        var image = new Image();
        image.onload = function() {
            var cnv = canvas.get(0);
            cnv.width = this.width;
            cnv.height = this.height;
            var ctx = cnv.getContext("2d");
            ctx.clearRect(0, 0, this.width, this.height);
            ctx.drawImage(image, 0, 0);
        };
        image.src = src;
    }
*/
