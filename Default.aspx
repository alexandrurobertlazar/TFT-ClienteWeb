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
        var searchQuery = ''
        document.getElementById("MainContent_TextBox1").addEventListener("keyup", async function (e) {
            // console.log(e.key)
            if (e.key === 'ArrowDown') {
                console.log('arrow')
                $('#number-options li').first().focus()
            }
            if (document.getElementById("MainContent_TextBox1").value === '') {
                reloadAllNumbers(true, true, true)
                searchQuery = ''
            }
            
            if (e.key === ' ') {
                clickedNumber(searchQuery.trim(), false, false)
                searchQuery = ''
                return
            } else {
                searchQuery = document.getElementById("MainContent_TextBox1").value.split(" ")[document.getElementById("MainContent_TextBox1").value.split(" ").length - 1]
            }
            getSimilarNumbers(searchQuery)
            /*if (searchQuery.trim() === 'con' || searchQuery.trim() === 'y' || searchQuery.trim() === 'coma') {
                searchQuery = ''
            }*/
        })
        document.addEventListener('keyup', function (e) {
            if (e.key == 'Tab') {
                console.log('hola')
                e.preventDefault()
            }
        })
    </script>
</asp:Content>