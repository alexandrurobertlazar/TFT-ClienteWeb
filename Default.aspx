<%@ Page Title="Conversor de texto a número" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="WebApplication4._Default" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">
    <!--wrapper of all the body-->
    <div class="flex flex-col w-full">
        <!--wrapper of all body except the footer-->
        <div class="flex flex-row w-full">
            <!--wrapper of body excluding the opening modal-->
            <div class="w-full" id="body-content">
                <!-- top bar (that isn't actually a top bar) -->
                <div class="flex flex-row justify-between">
                    <div></div>
                    <div class="bg-gray-300 p-6 rounded-bl-2xl text-4xl cursor-pointer hover:text-green-500 hover:font-bold" id="help-button" onclick="openModal()">
                        <p>Ayuda</p>
                    </div>
                </div>
                <script src="https://unpkg.com/tailwindcss-jit-cdn"></script>
                <div class="flex flex-row justify-center items-center mt-8">
                    <div class="flex flex-row justify-center bg-gray-300 sm:rounded-full p-12 py-16 w-full sm:w-3/4 lg:w-2/3">
                        <h1 class="text-5xl md:text-6xl lg:text-8xl text-red-600 font-bold text-center">Conversor de texto a número</h1>
                    </div>
                </div>
                <div class="row">
                    <div class="flex flex-col items-center mt-10">
                        <asp:TextBox ID="TextBox1" runat="server" CssClass="rounded-2xl py-8 sm:py-6 md:py-4 w-3/4 sm:w-1/2 text-3xl sm:text-2xl md:text-3xl lg:text-4xl bg-gray-300 text-center" autocomplete="off" placeholder="Pon aquí cualquier número que imagines..."></asp:TextBox>
                        <ul class="mt-4 text-6xl md:text-5xl lg:text-4xl bg-gray-300 rounded-md max-h-40 overflow-y-auto md:w-1/5" id="number-options"></ul>
                        <asp:Label ID="Label1" runat="server" CssClass="mt-12 bg-green-500 rounded-md w-1/2 md:w-1/3 text-2xl md:text-4xl py-6 text-center">El resultado se mostrará aquí</asp:Label>
                        <asp:Button ID="Button1" runat="server" Text="Enviar" CssClass="text-3xl md:text-5xl lg:text-6xl mt-24 w-1/4 rounded-full bg-green-500 px-2 py-8 font-bold" Visible="True" OnClick="Button1_Click" UseSubmitBehavior="False" />
                    </div>        
                </div>
            </div>
            <!--wrapper of modal-->
            <div class="absolute right-0 h-screen bg-gray-300 flex flex-col justify-center text-center px-4 w-full md:w-1/4 modal-closed" id="modal">
                <div class="absolute right-0 top-0 p-6 rounded-bl-2xl text-4xl border-b border-l border-black hover:text-green-500 hover:font-bold cursor-pointer" onclick="closeModal()">
                    <p>Cerrar</p>
                </div>
                <p class="text-3xl">Inserta tu propio número o utiliza algunos de nuestros ejemplos:<br /><br />
                <span class="text-blue-700 cursor-pointer underline" onclick="setNumber('doscientos mil ochocientos cuatro')">doscientos mil ochocientos cuatro</span><br />
                <span class="text-blue-700 cursor-pointer underline" onclick="setNumber('dos dosmilcuatrocientostresavos')">dos dosmilcuatrocientostresavos</span><br />
                <span class="text-blue-700 cursor-pointer underline" onclick="setNumber('veinte coma cuatrocientos ocho')">veinte coma cuatrocientos ocho</span><br />
                <span class="text-blue-700 cursor-pointer underline" onclick="setNumber('dos con una milésima')">dos con una milésima</span>
                </p><br /><br />

                <p class="text-3xl">Al insertar tu propio número, deja que la función de “Autocompletar” te ayude. Para seleccionar una opción u otra con el teclado, utiliza las flechas, y, una vez tengas tu opción elegida, pulsa el tabulador.</p><br />

                <p class="text-3xl">Nota: La función de "Autocompletar" solamente funciona con números enteros y decimales. Los fraccionarios se deberán introducir manualmente.</p>
            </div>
        </div>
        
        <footer class="mt-12 w-full absolute bottom-0">
            <div class="flex flex-row items-center justify-center bg-gray-300 py-4 px-4">
                <p class="text-3xl">Si quieres citar esta obra, hazlo de la siguiente manera:<br /><br />
                <i class="text-3xl">“Lazar, A. R. (2022, junio). Conversor de nomenclatura numérica en español a cifra.”</i></p>
            </div>
        </footer>
    </div>

    <script src="Scripts/CustomScripts/Autocomplete.js"></script>
    <script>
        function setNumber(num) {
            document.getElementById("MainContent_TextBox1").value = num
        }
        function openModal() {
            $('#help-button').css('visibility', 'hidden')
            document.querySelector('footer').classList.remove('w-full')
            document.querySelector('footer').classList.add('w-3/4')
            document.querySelector('#body-content').classList.remove('w-full')
            document.querySelector('#body-content').classList.add('w-3/4')
            document.querySelector('#modal').classList.remove('modal-closed')
            document.querySelector('#modal').classList.add('modal-open')
        }

        function closeModal() {
            document.querySelector('#modal').classList.remove('modal-open')
            document.querySelector('#modal').classList.add('modal-closed')
            $('#help-button').css('visibility', '')
            document.querySelector('footer').classList.add('w-full')
            document.querySelector('footer').classList.remove('w-3/4')
            document.querySelector('#body-content').classList.add('w-full')
            document.querySelector('#body-content').classList.remove('w-3/4')
        }
        function focusFieldToLastChar(id) {
            var inputField = document.getElementById(id);
            if (inputField != null && inputField.value.length != 0) {
                if (inputField.createTextRange) {
                    var FieldRange = inputField.createTextRange();
                    FieldRange.moveStart('character', inputField.value.length);
                    FieldRange.collapse();
                    FieldRange.select();
                } else if (inputField.selectionStart || inputField.selectionStart == '0') {
                    var elemLen = inputField.value.length;
                    inputField.selectionStart = elemLen;
                    inputField.selectionEnd = elemLen;
                    inputField.focus();
                }
            } else {
                inputField.focus();
            }
        }

        document.getElementById("MainContent_TextBox1").addEventListener("input", async function (e) {
            getSimilarNumbers(this.value)
        })
        $(window).on('load', function (e) {
            document.getElementById("MainContent_TextBox1").focus()
        })
        document.getElementById("MainContent_TextBox1").addEventListener("focus", async function (e) {
            $("li[active]").removeAttr('active').css('font-weight', 'normal')
        })
        window.addEventListener('keydown', function (e) {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault()
                    if ($("li[active]").length == 0)
                        $("li:first()")
                            .attr('active', '1')
                            .css('font-weight', 'bold')
                    else
                        $("li[active]")
                            .removeAttr('active')
                            .css('font-weight', 'normal')
                            .next()
                            .attr('active', '1')
                            .css('font-weight', 'bold')

                    break;
                case 'ArrowUp':
                    e.preventDefault()
                    if ($("li[active]").length == 0)
                        $("li:last()")
                            .attr('active', '1')
                            .css('font-weight', 'bold')
                    else
                        $("li[active]")
                            .removeAttr('active')
                            .css('font-weight', 'normal')
                            .prev()
                            .attr('active', '1')
                            .css('font-weight', 'bold')
                    break
                case 'Tab':
                    e.preventDefault()
                    if ($("li[active]").length != 0) {
                        clickedNumber($('li[active]')[0].innerHTML.slice(0, -4))
                    }
                    $("li[active]").removeAttr('active').css('font-weight', 'normal')
                    // document.getElementById("MainContent_TextBox1").focus()
                    break
                case 'Enter':
                    e.preventDefault()
                    $('#MainContent_Button1').click()
                    break
            }
            if ($("li[active]").length != 0) this.location = '#' + $("li[active]")[0].id
            else {
                focusFieldToLastChar('MainContent_TextBox1')
            }
        });
    </script>
</asp:Content>