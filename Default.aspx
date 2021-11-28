<%@ Page Title="Conversor de texto a número" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="WebApplication4._Default" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">
    <script src="https://unpkg.com/tailwindcss-jit-cdn"></script>
    <div class="jumbotron flex flex-row justify-center text-5xl">
        <h2>Conversor de texto a número</h2>
    </div>

    <div class="row">
        <p class="italic text-center">Bienvenido a esta página web. Por favor, inserte el texto con números que desea convertir en el siguiente recuadro (máximo: 999 vigintillones):</p>
        <div class="flex flex-col items-center mt-10">
            <asp:TextBox ID="TextBox1" runat="server" CssClass="rounded-md w-1/3"></asp:TextBox>
            <asp:Button ID="Button1" runat="server" Text="Enviar" CssClass="mt-3 w-1/3 rounded-md" Visible="True" OnClick="Button1_Click" UseSubmitBehavior="False" />
            <asp:Label ID="Label1" runat="server" CssClass="mt-5"></asp:Label>
            <asp:Label ID="Label2" runat="server"></asp:Label>
        </div>
        
    </div>
</asp:Content>
