var datos = JSON.parse(localStorage.getItem("datosCrediRapido")) || []

var guardarDatos = function(){
    localStorage.setItem("datosCrediRapido", JSON.stringify(datos))
}

var registrar = function(){
    var email = document.getElementById("email").value
    var password = document.getElementById("password").value
    var name = document.getElementById("name").value
    var identificacion = document.getElementById("identificacion").value
    var edad = document.getElementById("edad").value
    var direccion = document.getElementById("direccion").value
    var telefono = document.getElementById("telefono").value

    if(email && password && name && identificacion && edad && direccion && telefono){

        var existe = datos.filter(function(item){ return item.email == email })
        if(existe.length > 0){
            alert("Este correo ya está registrado. Usa otro o inicia sesión.")
            return
        }

        datos.push({
            email: email,
            password: password,
            name: name,
            identificacion: identificacion,
            edad: edad,
            direccion: direccion,
            telefono: telefono
        })
        guardarDatos()
        alert("Registro exitoso. Ahora puedes iniciar sesión.")
        window.location.href = "./login.html"
    } else {
        alert("Por favor completa todos los campos.")
    }
}

var entrar = function(){
    var email = document.getElementById("email").value
    var password = document.getElementById("password").value

    var usuario = datos.filter(function(item){
        return item.email == email && item.password == password
    })

    if(usuario.length > 0){
        localStorage.setItem("usuarioLogeado", JSON.stringify(usuario[0]))
        window.location.href = "./index.html"
    } else {
        alert("Correo o contraseña incorrectos.")
    }                                                                      
}

var cerrarSesion = function(){
    localStorage.removeItem("usuarioLogeado")
    window.location.href = "./index.html"
}

var actualizarNavbar = function(){
    var navButtons = document.getElementById("navButtons")
    var navMiPerfil = document.getElementById("navMiPerfil")
    var usuario = JSON.parse(localStorage.getItem("usuarioLogeado"))

    if(navButtons){
        if(usuario){
            navButtons.innerHTML = '<a class="btn btn-outline-warning mr-2 mb-2 mb-lg-0" href="micredito.html">Mi Crédito</a><button class="btn btn-warning" onclick="cerrarSesion()">Cerrar Sesión</button>'
        }
    }

    if(navMiPerfil){
        navMiPerfil.style.display = usuario ? "block" : "none"
    }
}

var solicitarCredito = function(){
    var usuario = JSON.parse(localStorage.getItem("usuarioLogeado"))
    if(usuario){
        window.location.href = "./solicitud.html"
    } else {
        window.location.href = "./login.html"
    }
}

var toggleDesembolso = function(){
    var metodo = document.querySelector('input[name="metodoDesembolso"]:checked')
    var campoTransferencia = document.getElementById("campoTransferencia")
    if(metodo && metodo.value == "transferencia"){
        campoTransferencia.style.display = "block"
    } else {
        campoTransferencia.style.display = "none"
    }
}

var calcularCredito = function(){
    var valor = parseFloat(document.getElementById("valorCredito").value)
    var cuotas = parseInt(document.getElementById("numCuotas").value)
    var diaPago = parseInt(document.getElementById("diaPago").value)
    var metodo = document.querySelector('input[name="metodoDesembolso"]:checked')
    var cuentaTransferencia = document.getElementById("cuentaTransferencia").value
    var usuario = JSON.parse(localStorage.getItem("usuarioLogeado"))

    if(!valor || valor <= 0){
        alert("Ingresa un valor de crédito válido.")
        return
    }
    if(!cuotas || cuotas < 1 || cuotas > 60){
        alert("El número de cuotas debe ser entre 1 y 60.")
        return
    }
    if(!diaPago || diaPago < 1 || diaPago > 15){
        alert("Selecciona un día de pago entre 1 y 15.")
        return
    }
    if(!metodo){
        alert("Selecciona un método de desembolso.")
        return
    }
    if(metodo.value == "transferencia" && !cuentaTransferencia){
        alert("Ingresa el número de cuenta o teléfono para la transferencia.")
        return
    }

    var tasa = 0.03
    var totalInteres = valor * tasa
    var totalPagar = valor + totalInteres
    var valorCuota = totalPagar / cuotas

    var hoy = new Date()
    var mesSiguiente = hoy.getMonth() + 1
    var anio = hoy.getFullYear()
    if(mesSiguiente > 11){
        mesSiguiente = 0
        anio++
    }
    var fechaPrimerPago = new Date(anio, mesSiguiente, diaPago)
    var opciones = { year: "numeric", month: "long", day: "numeric" }
    var fechaFormateada = fechaPrimerPago.toLocaleDateString("es-ES", opciones)

    document.getElementById("totalPagar").textContent = "$" + totalPagar.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    document.getElementById("fechaPrimerPago").textContent = fechaFormateada

    var tbody = document.getElementById("planPagos")
    tbody.innerHTML = ""
    var planPagosArr = []
    for(var i = 1; i <= cuotas; i++){
        var fechaCuota = new Date(anio, mesSiguiente + i - 1, diaPago)
        planPagosArr.push({
            cuota: i,
            fecha: fechaCuota.toLocaleDateString("es-ES", opciones),
            valor: valorCuota
        })
        var fila = "<tr><td>" + i + "</td><td>" + fechaCuota.toLocaleDateString("es-ES", opciones) + "</td><td>$" + valorCuota.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</td></tr>"
        tbody.innerHTML += fila
    }

    var desembolsoInfo = document.getElementById("desembolsoInfo")
    if(metodo.value == "efectivo"){
        desembolsoInfo.innerHTML = "<strong>Método de desembolso:</strong> Efectivo<br><strong>Dirección de entrega:</strong> " + (usuario ? usuario.direccion : "—")
    } else {
        desembolsoInfo.innerHTML = "<strong>Método de desembolso:</strong> Transferencia<br><strong>Número de cuenta/teléfono:</strong> " + cuentaTransferencia
    }

    window.solicitudData = {
        valor: valor,
        cuotas: cuotas,
        diaPago: diaPago,
        metodo: metodo.value,
        cuentaTransferencia: metodo.value == "transferencia" ? cuentaTransferencia : null,
        totalPagar: totalPagar,
        valorCuota: valorCuota,
        fechaPrimerPago: fechaFormateada,
        planPagos: planPagosArr
    }

    document.getElementById("resultados").style.display = "block"
    document.getElementById("resultados").scrollIntoView({ behavior: "smooth" })
}

var enviarSolicitud = function(){
    if(!window.solicitudData){
        alert("Primero calcula el crédito.")
        return
    }
    localStorage.setItem("solicitudActual", JSON.stringify(window.solicitudData))
    alert("Solicitud enviada con éxito. Revisa tu crédito en 'Mi Crédito'.")
    window.location.href = "./micredito.html"
}

var guardarPerfil = function(){
    var usuario = JSON.parse(localStorage.getItem("usuarioLogeado"))
    if(!usuario){
        alert("Debes iniciar sesión.")
        return
    }

    var email = document.getElementById("email").value
    var password = document.getElementById("password").value
    var name = document.getElementById("name").value
    var identificacion = document.getElementById("identificacion").value
    var edad = document.getElementById("edad").value
    var direccion = document.getElementById("direccion").value
    var telefono = document.getElementById("telefono").value

    if(email && password && name && identificacion && edad && direccion && telefono){
        for(var i = 0; i < datos.length; i++){
            if(datos[i].email == usuario.email){
                datos[i].email = email
                datos[i].password = password
                datos[i].name = name
                datos[i].identificacion = identificacion
                datos[i].edad = edad
                datos[i].direccion = direccion
                datos[i].telefono = telefono
                break
            }
        }

        usuario.email = email
        usuario.password = password
        usuario.name = name
        usuario.identificacion = identificacion
        usuario.edad = edad
        usuario.direccion = direccion
        usuario.telefono = telefono

        localStorage.setItem("usuarioLogeado", JSON.stringify(usuario))
        guardarDatos()
        alert("Perfil actualizado con éxito.")
        window.location.href = "./index.html"
    } else {
        alert("Por favor completa todos los campos.")
    }
}

