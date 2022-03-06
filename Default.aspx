<%@ Page Title="Conversor de texto a número" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="WebApplication4._Default" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">
    <script src="https://unpkg.com/tailwindcss-jit-cdn"></script>
    <div class="row py-5"></div> <!-- spacer -->
    <div class="jumbotron flex flex-row justify-center text-5xl">
        <h2>Conversor de texto a número</h2>
    </div>
    
    <div class="row">
        <p class="italic text-center">Bienvenido a esta página web. Por favor, inserte el texto con números que desea convertir en el siguiente recuadro (máximo: 999 vigintillones):</p>
        <div class="flex flex-col items-center mt-10">
            <span class="mt-5">Inserte aquí el número:</span>
            <asp:TextBox ID="TextBox1" runat="server" CssClass="rounded-md w-1/3" autocomplete="off"></asp:TextBox>
            <asp:Button ID="Button1" runat="server" Text="Enviar" CssClass="mt-3 w-1/3 rounded-md" Visible="True" OnClick="Button1_Click" UseSubmitBehavior="False" />
            <asp:Label ID="Label1" runat="server" CssClass="mt-5"></asp:Label>
            <asp:Label ID="Label2" runat="server"></asp:Label>
            <ul class="bg-gray-300 rounded-md max-h-40 overflow-y-auto" id="number-options"></ul>
        </div>
        
    </div>
    <div class="row py-5"></div> <!-- spacer -->
    <script src="Scripts/CustomScripts/Autocomplete.js"></script>
    <script>
        document.getElementById("MainContent_TextBox1").addEventListener("input", async function (e) {
            getSimilarNumbers(this.value)
        })
        $(window).on('load', function (e) {
            document.getElementById("MainContent_TextBox1").focus()
        })
        window.addEventListener('keydown', function (e) {
            switch (e.key) {
                case 'ArrowDown':
                    if ($("li[active]").length == 0)
                        $("li:first()")
                            .attr('active', '1')
                            .css('color', 'red')
                    else
                        $("li[active]")
                            .removeAttr('active')
                            .css('color', 'green')
                            .next()
                            .attr('active', '1')
                            .css('color', 'red')

                    break;
                case 'ArrowUp':
                    if ($("li[active]").length == 0)
                        $("li:last()")
                            .attr('active', '1')
                            .css('color', 'red')
                    else
                        $("li[active]")
                            .removeAttr('active')
                            .css('color', 'green')
                            .prev()
                            .attr('active', '1')
                            .css('color', 'red')
                    break
                case 'Tab':
                    if ($("li[active]").length != 0) {
                        clickedNumber($('li[active]')[0].innerHTML.slice(0, -4))
                    }
                    $("li[active]").removeAttr('active').css('color', 'black')
                    document.getElementById("MainContent_TextBox1").focus()
                    e.preventDefault()
                    break
                case 'Enter':
                    e.preventDefault()
                    $('#MainContent_Button1').click()
                    break
            }
            if ($("li[active]").length != 0) this.location = '#' + $("li[active]")[0].id
        });
    </script>
</asp:Content>