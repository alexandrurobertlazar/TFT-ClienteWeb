<%@ Page Title="Inicio | Conversor de texto a números" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="WebApplication4._Default" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">
    <div class="flex flex-row w-full" id="body">
        <div class="w-full mt-16 sm:mt-32" id="body-content">
            <div class="flex flex-row justify-center items-center">
                <div class="flex flex-row justify-center bg-gray-300 sm:rounded-full p-12 py-16 w-full sm:w-3/4 lg:w-2/3">
                    <h1 class="text-5xl lg:text-6xl text-blue-700 font-bold text-center">Conversor de texto a número</h1>
                </div>
            </div>
            <asp:Panel runat="server" ID="PanelResultado" CssClass="mt-10">
                <div class="flex flex-col items-center">
                    <asp:TextBox ID="TextBox1" runat="server" CssClass="sm:rounded-2xl py-8 sm:py-6 md:py-4 rounded-none w-full sm:w-1/2 text-3xl sm:text-2xl md:text-3xl lg:text-4xl bg-gray-300 text-center" autocomplete="off" placeholder="Escribe el número con palabras"></asp:TextBox>
                    <ul class="mt-4 w-full rounded-none sm:w-1/2 text-center bg-gray-300 text-2xl sm:rounded-md max-h-40 overflow-y-auto border border-black" id="number-options"></ul>
                    <asp:UpdatePanel runat="server" ID="PanelActualizacionResultado" class="mt-6 bg-blue-700 text-white rounded-md w-full sm:w-1/2 md:w-1/3 text-2xl md:text-4xl py-6 text-center">
                        <ContentTemplate>
                            <asp:Label ID="Label1" runat="server">El resultado se mostrará aquí</asp:Label>
                        </ContentTemplate>
                        <Triggers>
                            <asp:AsyncPostBackTrigger ControlID="Button1" />
                        </Triggers>
                    </asp:UpdatePanel>
                    <asp:Button ID="Button1" runat="server" Text="Convertir" CssClass="text-3xl md:text-5xl lg:text-6xl mt-6 w-1/4 rounded-full bg-blue-700 text-white px-2 py-6 font-bold" Visible="True" OnClick="Button1_Click" UseSubmitBehavior="False" OnClientClick="document.getElementById('number-options').innerHTML=''" />
                </div>
            </asp:Panel>                
        </div>
    </div>
    <script src="Scripts/CustomScripts/Autocomplete.js"></script>
    <script>
        function focusFieldToLastChar() {
            var inputField = document.getElementById('MainContent_TextBox1');
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
                    break
                case 'Enter':
                    e.preventDefault()
                    $('#MainContent_Button1').click()
                    break
                default:
                    return
            }
            if ($("li[active]").length != 0) this.location = '#' + $("li[active]")[0].id
            else {
                focusFieldToLastChar()
            }
        });
    </script>
</asp:Content>