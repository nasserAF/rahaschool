// main.js

$(document).ready(function(){
    // Load Navbar and Footer
    $("#navbar-placeholder").load("/school-website/includes/navbar.html");
    $("#footer-placeholder").load("/school-website/includes/footer.html");

    // Initialize Carousel
    $('.carousel').carousel({
        interval: 5000
    });

    // Hover Animation on Images
    $('.section img').hover(
        function() {
            $(this).addClass('animate__animated animate__zoomIn');
        },
        function() {
            $(this).removeClass('animate__animated animate__zoomIn');
        }
    );

    // Section Animations on Scroll
    $('.section').each(function(){
        var element = $(this);
        element.waypoint(function(direction){
            element.addClass('animate__fadeInUp');
        }, {
            offset: '80%'
        });
    });

    // Vision Page Animations with Delay
    $('.card').each(function(index){
        var element = $(this);
        setTimeout(function(){
            element.addClass('animate__fadeInUp');
        }, index * 300);
    });
});
